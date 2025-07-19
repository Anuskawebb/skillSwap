import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user with all related data needed for dashboard
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        SessionsTaught: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            learner: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        SessionsLearned: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            teacher: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has completed onboarding
    if (!user.hasOnboarded) {
      return NextResponse.json(
        {
          error: "Onboarding not completed",
          redirectTo: "/onboard",
        },
        { status: 403 },
      );
    }

    // Calculate derived stats from user data
    const teachingSkills = user.skillsOffered || [];
    const learningSkills = user.learningGoals || [];

    const completedSessionsTaught = user.SessionsTaught.filter((s) =>
      s.title.includes("completed"),
    ).length;
    const completedSessionsLearned = user.SessionsLearned.filter((s) =>
      s.title.includes("completed"),
    ).length;
    const completedSessions =
      completedSessionsTaught + completedSessionsLearned;

    // Generate some mock XP based on user data - in a real app this would be stored in the database
    const totalXP =
      teachingSkills.length * 50 +
      learningSkills.length * 30 +
      completedSessions * 100;

    // Mock average rating - in a real app this would come from actual reviews
    const averageRating = 4.5 + Math.random() * 0.5; // Random rating between 4.5-5.0

    // Mock reputation score based on activity
    const reputation = Math.min(
      95,
      50 + teachingSkills.length * 5 + completedSessions * 3,
    );

    // Generate analytics data
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get weekly XP progress (mock data based on total XP)
    const weeklyXP = Array.from({ length: 7 }, (_, i) => {
      const baseXP = Math.floor(totalXP / 7);
      const variation = Math.floor(Math.random() * 20) - 10;
      return Math.max(0, baseXP + variation);
    });

    // Get skill progress for teaching skills
    const skillProgress = teachingSkills.slice(0, 5).map((skill) => ({
      skill: typeof skill === "string" ? skill : skill,
      progress: Math.floor(Math.random() * 50) + 50, // Random progress between 50-100
    }));

    // Get session trends for the last 7 days (mock)
    const sessionTrends = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekAgo.getTime() + i * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split("T")[0],
        sessions: Math.floor(Math.random() * 3) + 1,
      };
    });

    // Generate mock activities based on user data
    const mockActivities = [
      {
        id: "a1",
        type: "skill_added",
        title: `Added teaching skill: ${teachingSkills[0] || "Programming"}`,
        description: "You're ready to share your knowledge!",
        createdAt: new Date(
          now.getTime() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        icon: "plus-circle",
        color: "bg-blue-100 text-blue-600",
      },
      {
        id: "a2",
        type: "profile_completed",
        title: "Profile completed successfully",
        description: "Welcome to SkillSwap! Your journey begins now.",
        createdAt: user.updatedAt.toISOString(),
        icon: "user-plus",
        color: "bg-green-100 text-green-600",
      },
      {
        id: "a3",
        type: "learning_goal_set",
        title: `Set learning goal: ${learningSkills[0] || "New Technology"}`,
        description: "Time to learn something new!",
        createdAt: new Date(
          now.getTime() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        icon: "target",
        color: "bg-purple-100 text-purple-600",
      },
    ];

    // Generate mock badges based on user activity
    const mockBadges = [];
    if (teachingSkills.length > 0) {
      mockBadges.push({
        id: "b1",
        name: "First Skill Teacher",
        description: "Added your first teaching skill",
        rarity: "BRONZE",
        earnedAt: user.updatedAt.toISOString(),
      });
    }
    if (learningSkills.length > 0) {
      mockBadges.push({
        id: "b2",
        name: "Lifelong Learner",
        description: "Set your first learning goal",
        rarity: "BRONZE",
        earnedAt: user.updatedAt.toISOString(),
      });
    }
    if (user.walletAddress) {
      mockBadges.push({
        id: "b3",
        name: "Web3 Pioneer",
        description: "Connected your crypto wallet",
        rarity: "SILVER",
        earnedAt: user.updatedAt.toISOString(),
      });
    }

    // Transform data for frontend
    const dashboardData = {
      user: {
        id: user.id,
        displayName: user.name,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        reputation,
        rating: averageRating,
        totalXP,
        skillsTeaching: teachingSkills.length,
        skillsLearning: learningSkills.length,
        sessionsCompleted: completedSessions,
        nftCertificates: mockBadges.length,
      },
      skills: {
        teaching: teachingSkills.map((skill, index) => ({
          id: `t-${index}`,
          skillName: typeof skill === "string" ? skill : String(skill),
          category: user.interests[0] || "Technology",
          proficiency: "Intermediate",
          xp: Math.floor(Math.random() * 40) + 60,
          sessionsCount: Math.floor(Math.random() * 5),
        })),
        learning: learningSkills.map((skill, index) => ({
          id: `l-${index}`,
          skillName: typeof skill === "string" ? skill : String(skill),
          category: user.interests[1] || "Technology",
          proficiency: "Beginner",
          xp: Math.floor(Math.random() * 50) + 20,
          sessionsCount: Math.floor(Math.random() * 3),
        })),
      },
      recentSessions: {
        taught: user.SessionsTaught.slice(0, 5).map((session) => ({
          id: session.id,
          skill: session.title,
          learner: {
            displayName: session.learner.name,
            avatarUrl: session.learner.avatarUrl,
          },
          status: "Completed",
          createdAt: session.createdAt.toISOString(),
          scheduledAt: session.scheduledAt?.toISOString(),
        })),
        learned: user.SessionsLearned.slice(0, 5).map((session) => ({
          id: session.id,
          skill: session.title,
          teacher: {
            displayName: session.teacher.name,
            avatarUrl: session.teacher.avatarUrl,
          },
          status: "Completed",
          createdAt: session.createdAt.toISOString(),
          scheduledAt: session.scheduledAt?.toISOString(),
        })),
      },
      badges: mockBadges,
      activities: mockActivities,
      reviews: [], // No reviews in current schema
      analytics: {
        weeklyXP,
        skillProgress,
        sessionTrends,
        categoryDistribution: user.interests.map((interest, index) => ({
          category: interest,
          count: index + 1,
        })),
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("DASHBOARD_API_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
