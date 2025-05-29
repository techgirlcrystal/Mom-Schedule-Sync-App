# Mom's Daily Planner - Personalized Spiritual Companion

A comprehensive React-based daily spiritual companion designed specifically for Christian mothers. This embeddable planning tool helps mothers organize their day while providing spiritual guidance, encouragement, and automated support through intelligent scheduling and reminder systems.

## 🌟 Features

### Core Planning Features
- **Intelligent Activity Scheduling**: Preset activities (cleaning, meal prep, self-care, etc.) with customizable durations
- **Custom Activity Creation**: Mothers can add their own tasks with flexible timing
- **Progress Tracking**: Real-time progress monitoring with visual indicators
- **Time Management**: Smart scheduling with start/end times and duration calculations

### Spiritual Guidance
- **Daily KJV Scripture**: Personalized Bible verses based on the mother's current feelings and needs
- **AI-Powered Prayers**: Custom prayers generated using OpenAI to match the mother's emotional state
- **Daily Devotional**: Encouraging spiritual content to start each day
- **Faith-Based Encouragement**: All content designed with Christian values and Biblical wisdom

### Communication & Support
- **Go High Level Integration**: Automated contact management and follow-up sequences
- **SMS Reminders**: Optional text message reminders to help mothers stay on track
- **Email Encouragement**: Automated encouraging emails from "Mother V"
- **Spam Protection Guidance**: Clear instructions to ensure mothers receive all communications

### User Experience
- **Mobile-First Design**: Responsive design optimized for phone and tablet use
- **African American Representation**: Images and content designed to represent African American mothers
- **Embeddable Widget**: Can be embedded on any website using iframe
- **Bookmark Functionality**: Mothers can save their daily schedule links for easy access
- **Progress Sharing**: Schedule links can be shared with family or accountability partners

## 🏗️ Technical Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom color scheme inspired by creativehands214.com
- **UI Components**: Radix UI components with custom theming
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express server
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o for personalized content generation
- **Authentication**: Session-based authentication with PostgreSQL storage
- **Webhooks**: Go High Level integration for automated marketing sequences

### Key Integrations
- **OpenAI API**: Powers personalized scripture selection and prayer generation
- **Go High Level CRM**: Manages contact creation, reminder sequences, and email automation
- **PostgreSQL Database**: Stores user schedules, progress tracking, and contact information

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- OpenAI API key
- Go High Level account with webhook access

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables (see .env.example)
cp .env.example .env

# Run database migrations
npm run db:push

# Start the development server
npm run dev
```

### Environment Variables
```
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=your_openai_api_key
GHL_API_KEY=your_go_high_level_api_key
GHL_LOCATION_ID=your_go_high_level_location_id
SESSION_SECRET=your_session_secret
```

## 📱 User Journey

### 1. Initial Setup
- Mother enters her name, email, and phone number
- Sets preferred start time for her daily schedule
- Chooses whether to receive reminder notifications

### 2. Daily Planning
- Selects from preset activities or creates custom tasks
- Activities are automatically ordered by priority and time requirements
- Self-care check helps personalize the spiritual content

### 3. Schedule Generation
- AI creates personalized scripture and prayer based on mother's responses
- Schedule is generated with specific start/end times for each activity
- Unique shareable link is created for the day's schedule

### 4. Daily Execution
- Progress tracking shows completion status in real-time
- Daily devotional provides spiritual encouragement
- Email reminders help mothers stay on track

### 5. Automated Follow-up
- Go High Level automations send encouraging emails
- Optional SMS reminders for important tasks
- Long-term relationship building through Mother V's guidance

## 🔗 Go High Level Integration

The system integrates with Go High Level through three main automation triggers:

1. **Contact Creation**: When a new mother signs up
2. **Reminder Opt-in**: When mothers choose to receive notifications
3. **Schedule Access**: When mothers click their daily schedule links

See `GO_HIGH_LEVEL_SETUP.txt` for detailed webhook configuration instructions.

## 🎨 Design Philosophy

- **Mother-Centered**: Every feature designed with busy mothers in mind
- **Faith-Based**: Integrates Christian values and Biblical wisdom throughout
- **Inclusive Representation**: Images and content represent African American mothers
- **Encouragement-Focused**: Positive, uplifting language in all communications
- **Practical Support**: Real-world solutions for time management challenges

## 📊 Key Components

### Planning Interface
- `ActivitySelection.tsx`: Main planning interface with preset and custom activities
- `SelfCareCheck.tsx`: Emotional and spiritual assessment for personalization
- `WelcomeStep.tsx`: Initial setup and time configuration

### Schedule Management
- `GeneratedSchedule.tsx`: Displays completed daily schedule with sharing options
- `Schedule.tsx`: Daily execution interface with progress tracking
- `CalendarIntegration.tsx`: Export capabilities for external calendars

### Spiritual Content
- `DailyDevotional.tsx`: Daily scripture and prayer display
- `PersonalizedDevotional.tsx`: AI-generated spiritual content
- `ai-service.ts`: OpenAI integration for content personalization

### Database Schema
- `schedules`: Stores daily plans and contact information
- `scheduleProgress`: Tracks task completion throughout the day
- `users`: Basic user information and preferences

## 🔧 Development

### Adding New Features
1. Update database schema in `shared/schema.ts`
2. Add storage methods in `server/storage.ts`
3. Create API endpoints in `server/routes.ts`
4. Build frontend components in `client/src/components/`
5. Update Go High Level webhooks if needed

### Testing
- Manual testing through the complete user journey
- Go High Level webhook testing with real contact creation
- Mobile responsiveness testing on various devices

## 📈 Deployment

The application is designed to be deployed on Replit with:
- Automatic HTTPS and domain management
- Integrated PostgreSQL database
- Environment variable management
- One-click deployment process

## 💝 Mission

This tool exists to support Christian mothers in their daily lives by combining practical time management with spiritual encouragement. Every feature is designed to help mothers feel supported, organized, and connected to their faith throughout their busy days.

---

**Created with love for mothers everywhere** ❤️

*"She is clothed with strength and dignity; she can laugh at the days to come." - Proverbs 31:25*