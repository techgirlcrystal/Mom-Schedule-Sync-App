export interface PresetActivity {
  activity: string;
  label: string;
  time: number;
  icon: string;
}

export const presetActivities: PresetActivity[] = [
  {
    activity: "school",
    label: "School Drop-off",
    time: 30,
    icon: "🎓"
  },
  {
    activity: "work",
    label: "Work Time",
    time: 240,
    icon: "💼"
  },
  {
    activity: "dinner-prep",
    label: "Dinner Prep",
    time: 45,
    icon: "🍽️"
  },
  {
    activity: "cooking",
    label: "Cooking",
    time: 60,
    icon: "🔥"
  },
  {
    activity: "doctor",
    label: "Doctor Visit",
    time: 90,
    icon: "🩺"
  },
  {
    activity: "me-time",
    label: "Me Time",
    time: 30,
    icon: "🧘‍♀️"
  },
  {
    activity: "exercise",
    label: "Exercise",
    time: 45,
    icon: "🏃‍♀️"
  },
  {
    activity: "cleaning",
    label: "House Cleaning",
    time: 60,
    icon: "🧹"
  },
  {
    activity: "kids-time",
    label: "Kids Time",
    time: 120,
    icon: "👶"
  },
  {
    activity: "grocery",
    label: "Grocery Shopping",
    time: 75,
    icon: "🛒"
  },
  {
    activity: "laundry",
    label: "Laundry",
    time: 30,
    icon: "👕"
  },
  {
    activity: "bible-study",
    label: "Bible Study",
    time: 45,
    icon: "📖"
  }
];

export function getActivityIcon(activityType: string): string {
  const preset = presetActivities.find(a => a.activity === activityType);
  return preset?.icon || "📝";
}

export function getActivityLabel(activityType: string): string {
  const preset = presetActivities.find(a => a.activity === activityType);
  return preset?.label || activityType;
}
