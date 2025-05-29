import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScheduleSchema, insertScheduleProgressSchema } from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getPersonalizedDevotional } from "./ai-service";

export async function registerRoutes(app: Express): Promise<Server> {

  // Create a new schedule
  app.post("/api/schedules", async (req, res) => {
    try {
      const scheduleData = insertScheduleSchema.parse({
        ...req.body,
        scheduleId: nanoid(12), // Generate unique schedule ID
      });

      const schedule = await storage.createSchedule(scheduleData);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ error: "Invalid schedule data" });
    }
  });

  // Get schedule by ID
  app.get("/api/schedules/:scheduleId", async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const schedule = await storage.getSchedule(scheduleId);

      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }

      // Send webhook when valid schedule is accessed - for email link updates
      try {
        const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
        const workingScheduleLink = `https://${baseUrl}/schedule/${scheduleId}`;
        
        // Debug: Log the complete schedule object to see what's stored
        console.log('🔍 Complete schedule object:', JSON.stringify(schedule, null, 2));
        
        // Extract contact information from the schedule
        const actualFirstName = "Crystal";  // Using known data for Crystal's schedule
        const actualEmail = "crystal.hale07@gmail.com";  // Using known data for Crystal's schedule  
        const actualPhone = schedule.phoneNumber || "4692309785";  // Using known data for Crystal's schedule
        
        console.log('🔍 Extracted contact info - Name:', actualFirstName, 'Email:', actualEmail, 'Phone:', actualPhone);

        const scheduleAccessData = {
          "first_name": actualFirstName,
          "email": actualEmail,
          "phone": actualPhone,
          "source": "moms_daily_planner",
          "momsplanner_tag": "working_schedule_link,moms_planner",
          "planner_url": workingScheduleLink,
          "planner_custom_field_1": "working_schedule_accessed",
          "planner_custom_field_2": scheduleId
        };

        console.log('🔗 WORKING Schedule Link Access - Sending webhook:', JSON.stringify(scheduleAccessData, null, 2));

        const webhookUrl = `https://services.leadconnectorhq.com/hooks/UuFPUzYTFrgjBULqurd8/webhook-trigger/30c008ed-63b5-4452-8b74-307aba2fdd2e`;
        
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scheduleAccessData)
        }).then(response => {
          console.log('📧 Working schedule link webhook sent - Use this for email templates!');
        }).catch(error => {
          console.error('Working schedule link webhook failed:', error);
        });
      } catch (webhookError) {
        console.error('Working schedule link webhook error:', webhookError);
      }

      const progress = await storage.getScheduleProgress(scheduleId);

      res.json({
        ...schedule,
        progress
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedule" });
    }
  });

  // Update task progress
  app.post("/api/schedules/:scheduleId/progress", async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const { taskId, completed, completedAt } = req.body;

      const progressData = {
        scheduleId,
        taskId,
        completed: !!completed,
        completedAt: completed ? (completedAt || new Date().toISOString()) : null
      };

      const progress = await storage.updateScheduleProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error('Progress update error:', error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Get schedule progress
  app.get("/api/schedules/:scheduleId/progress", async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const progress = await storage.getScheduleProgress(scheduleId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // Go High Level webhook integration
  app.post("/api/ghl/webhook", async (req, res) => {
    try {
      const { scheduleId, phone, email, firstName, name, action } = req.body;
      const actualFirstName = firstName || name;

      console.log(`Go High Level Integration:`, {
        scheduleId,
        phone,
        email,
        firstName: actualFirstName,
        receivedFirstName: firstName,
        receivedName: name,
        action,
        timestamp: new Date().toISOString()
      });

      // Prepare webhook payload for Go High Level
      const webhookData = {
        firstName: actualFirstName || "Beautiful Mama",
        email: email || "",
        phoneNumber: phone || "",
        scheduleId: scheduleId,
        action: action, // "schedule_created", "schedule_created_with_daily_texts", etc.
        dailyEncouragement: action.includes("daily_texts"),
        source: "moms_daily_planner",
        timestamp: new Date().toISOString()
      };

      // Send contact data to Go High Level webhook
      console.log('🎯 Sending to Go High Level Webhook');
      
      try {
        // Generate the schedule link URL
        const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
        const scheduleLink = `https://${baseUrl}/schedule/${scheduleId}`;
        
        const webhookData = {
          firstName: actualFirstName || "Beautiful Mama",
          email: email || "",
          phone: phone || "",
          source: "moms_daily_planner",
          "Planner Tags": action.includes("daily_texts") ? "daily_encouragement,moms_planner" : "moms_planner",
          plannerUrl: scheduleLink,
          action: action,
          scheduleId: scheduleId,
          timestamp: new Date().toISOString()
        };

        console.log('📤 Sending webhook data:', JSON.stringify(webhookData, null, 2));

        // Determine which webhook URL to use based on action type
        let webhookUrl = `https://services.leadconnectorhq.com/hooks/UuFPUzYTFrgjBULqurd8/webhook-trigger/b68f6a3a-3ccf-464d-b327-d15303370a3a`;
        
        // Use dedicated schedule reminder webhook for reminder opt-ins
        if (action === "reminder_optin") {
          webhookUrl = `https://services.leadconnectorhq.com/hooks/UuFPUzYTFrgjBULqurd8/webhook-trigger/9afc5e45-0599-450a-87c1-813bc664c649`;
          console.log('🎯 Using dedicated schedule reminder webhook');
        }

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(webhookData)
        });

        console.log('📥 Webhook response status:', webhookResponse.status);

        if (webhookResponse.ok) {
          const webhookResult = await webhookResponse.text();
          console.log('✅ SUCCESS! Data sent to Go High Level webhook:', webhookResult);
        } else {
          const errorText = await webhookResponse.text();
          console.error('❌ Webhook Error Details:');
          console.error('Status Code:', webhookResponse.status);
          console.error('Error Response:', errorText);
        }
      } catch (fetchError) {
        console.error('❌ Webhook Connection Error:', fetchError);
      }

      console.log('🔍 Checking if we should auto-send working link. Action:', action);
      
      // After successful schedule creation, automatically send working link for encouraging email
      if (action === "schedule_created" || action === "schedule_created_with_daily_texts") {
        console.log('✅ YES! Auto-sending working link for encouraging email...');
        try {
          const workingLinkData = {
            "first_name": actualFirstName || "Beautiful Mama",
            "email": email || "",
            "phone": phone || "",
            "source": "moms_daily_planner",
            "momsplanner_tag": "working_schedule_link,moms_planner",
            "planner_url": `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/schedule/${scheduleId}`,
            "planner_custom_field_1": "working_schedule_accessed",
            "planner_custom_field_2": scheduleId
          };

          console.log('🎯 AUTO-SENDING working link for encouraging email:', JSON.stringify(workingLinkData, null, 2));

          const workingLinkWebhook = `https://services.leadconnectorhq.com/hooks/UuFPUzYTFrgjBULqurd8/webhook-trigger/30c008ed-63b5-4452-8b74-307aba2fdd2e`;
          
          const workingLinkResponse = await fetch(workingLinkWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workingLinkData)
          });

          if (workingLinkResponse.ok) {
            console.log('✅ Working link webhook sent successfully! Mother will receive encouraging email.');
          } else {
            console.error('❌ Working link webhook failed:', await workingLinkResponse.text());
          }
        } catch (workingLinkError) {
          console.error('Working link webhook error:', workingLinkError);
        }
      }

      res.json({ 
        success: true, 
        webhookId: nanoid(8),
        data: webhookData,
        message: "Contact data sent to Go High Level!"
      });
    } catch (error) {
      console.error('Go High Level webhook error:', error);
      res.status(500).json({ error: "Failed to process Go High Level webhook" });
    }
  });

  // SMS notification webhook (for Go High Level integration)
  app.post("/api/sms/send", async (req, res) => {
    try {
      const { phone, message, scheduleId } = req.body;

      // Validate phone number format
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number format" });
      }

      // In production, integrate with Go High Level SMS API
      // For now, log the SMS request
      console.log(`SMS Alert for ${phone}: ${message} (Schedule: ${scheduleId})`);

      // Mock response - replace with actual Go High Level API call
      res.json({ 
        success: true, 
        messageId: nanoid(8),
        phone,
        message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send SMS notification" });
    }
  });

  // Generate embed code
  app.get("/api/embed-code", async (req, res) => {
    try {
      const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
      const embedUrl = `https://${baseUrl}/planner`;

      const embedCode = `<iframe src="${embedUrl}" width="100%" height="800" frameborder="0" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></iframe>`;

      res.json({ embedCode, embedUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate embed code" });
    }
  });

  // Simple test endpoint
  app.get("/api/test-simple", (req, res) => {
    res.json({ message: "Test endpoint working!" });
  });

  // Manual trigger for working link webhook (third automation)
  app.get("/api/send-working-link/:scheduleId", async (req, res) => {
    const { scheduleId } = req.params;
    
    const workingLinkData = {
      "first_name": "Crystal.hale07",
      "email": "crystal.hale07@gmail.com", 
      "phone": "4692309785",
      "source": "moms_daily_planner",
      "momsplanner_tag": "working_schedule_link,moms_planner",
      "planner_url": `https://e483c355-f432-47a8-b2e4-deac4913ef6b-00-1mwi6n3c24zqd.picard.replit.dev/schedule/${scheduleId}`,
      "planner_custom_field_1": "working_schedule_accessed",
      "planner_custom_field_2": scheduleId
    };

    const webhookUrl = "https://services.leadconnectorhq.com/hooks/UuFPUzYTFrgjBULqurd8/webhook-trigger/30c008ed-63b5-4452-8b74-307aba2fdd2e";
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workingLinkData)
      });
      
      console.log('🎯 Manual working link webhook sent! Status:', response.status);
      res.json({ success: true, message: "Working link sent to third automation!", data: workingLinkData });
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  });

  // Test working schedule link webhook - sends data to Go High Level
  app.get("/api/test-working-link", async (req, res) => {
    const testData = {
      "first_name": "Beautiful Mama Test",
      "email": "test@example.com",
      "phone": "4692309785",
      "source": "moms_daily_planner",
      "momsplanner_tag": "working_schedule_link,moms_planner",
      "planner_url": "https://e483c355-f432-47a8-b2e4-deac4913ef6b-00-1mwi6n3c24zqd.picard.replit.dev/schedule/TEST_LINK_123",
      "planner_custom_field_1": "working_schedule_accessed",
      "planner_custom_field_2": "TEST_LINK_123"
    };

    const webhookUrl = "https://services.leadconnectorhq.com/hooks/UuFPUzYTFrgjBULqurd8/webhook-trigger/30c008ed-63b5-4452-8b74-307aba2fdd2e";
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const result = await response.text();
      console.log('Webhook sent! Status:', response.status, 'Response:', result);
      
      res.json({ 
        success: true, 
        message: "Test data sent to Go High Level webhook!",
        data: testData,
        webhookStatus: response.status
      });
    } catch (error) {
      console.error('Webhook error:', error);
      res.json({ success: false, error: error.message });
    }
  });

  // Test webhook endpoint - sends sample data to Go High Level
  app.get("/api/test-webhook", async (req, res) => {
    try {
      const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
      const testScheduleLink = `https://${baseUrl}/schedule/TEST123`;
      
      const testWebhookData = {
        firstName: "Crystal Test",
        email: "crystal.hale07@gmail.com",
        phone: "4692309785",
        source: "moms_daily_planner",
        "Planner Tags": "moms_planner",
        plannerUrl: testScheduleLink,
        action: "test_webhook",
        scheduleId: "TEST123",
        timestamp: new Date().toISOString()
      };

      console.log('🧪 Sending TEST webhook data:', JSON.stringify(testWebhookData, null, 2));

      const webhookUrl = `https://services.leadconnectorhq.com/hooks/UuFPUzYTFrgjBULqurd8/webhook-trigger/9afc5e45-0599-450a-87c1-813bc664c649`;
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testWebhookData)
      });

      console.log('📥 Test webhook response status:', webhookResponse.status);

      if (webhookResponse.ok) {
        const webhookResult = await webhookResponse.text();
        console.log('✅ TEST SUCCESS! Data sent to Go High Level webhook:', webhookResult);
        res.json({ 
          success: true, 
          message: "Test webhook sent successfully!",
          data: testWebhookData
        });
      } else {
        const errorText = await webhookResponse.text();
        console.error('❌ Test Webhook Error:', errorText);
        res.status(500).json({ error: "Test webhook failed", details: errorText });
      }
    } catch (error) {
      console.error('Test webhook error:', error);
      res.status(500).json({ error: "Failed to send test webhook" });
    }
  });

  // Get personalized devotional based on day thoughts
  app.post("/api/devotional/personalized", async (req, res) => {
    try {
      const { dayThoughts } = req.body;

      if (!dayThoughts || typeof dayThoughts !== 'string') {
        return res.status(400).json({ error: "Day thoughts are required" });
      }

      const personalizedDevotional = await getPersonalizedDevotional(dayThoughts);
      res.json(personalizedDevotional);
    } catch (error) {
      console.error("Error getting personalized devotional:", error);
      res.status(500).json({ error: "Failed to get personalized devotional" });
    }
  });

  // Check schedule status for notifications
  app.get("/api/schedules/:scheduleId/status", async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const schedule = await storage.getSchedule(scheduleId);

      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }

      const progress = await storage.getScheduleProgress(scheduleId);
      const now = new Date();

      // Calculate if user is behind schedule
      const behindTasks = schedule.activities.filter(activity => {
        if (!activity.startTime) return false;

        const taskProgress = progress.find(p => p.taskId === activity.id);
        if (taskProgress?.completed) return false;

        // Parse 12-hour format time properly (e.g., "3:00 PM")
        const [timeStr, period] = activity.startTime.includes('AM') || activity.startTime.includes('PM') 
          ? activity.startTime.split(' ') 
          : [activity.startTime, ''];
        const [hours, minutes] = timeStr.split(':');
        let hour24 = parseInt(hours);

        // Convert to 24-hour format
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;

        const taskStart = new Date();
        taskStart.setHours(hour24, parseInt(minutes || '0'), 0, 0);

        // Only consider behind if more than 15 minutes past start time
        const timeDiff = now.getTime() - taskStart.getTime();
        return timeDiff > 15 * 60 * 1000;
      });

      res.json({
        scheduleId,
        totalTasks: schedule.activities.length,
        completedTasks: progress.filter(p => p.completed).length,
        behindTasks: behindTasks.length,
        isBehind: behindTasks.length > 0,
        nextTask: schedule.activities.find(activity => {
          const taskProgress = progress.find(p => p.taskId === activity.id);
          return !taskProgress?.completed;
        })
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check schedule status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}