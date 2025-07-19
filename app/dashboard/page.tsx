"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Zap,
  Shield,
  Settings,
  Bell,
  Edit3,
  Plus,
  MessageCircle,
  Trophy,
  Target,
  Wallet,
  Heart,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Play,
  User,
  Gift,
  Globe,
  ChevronRight,
  Timer,
  BookMarked,
  Users2,
  Eye,
  ThumbsUp,
  PlusCircle,
  Activity,
  UserPlus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

// --- Interfaces (kept for structure) ---
interface DashboardData {
  user: {
    id: string;
    displayName: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
    reputation: number;
    rating: number;
    totalXP: number;
    skillsTeaching: number;
    skillsLearning: number;
    sessionsCompleted: number;
    nftCertificates: number;
  };
  skills: {
    teaching: Array<{
      id: string;
      skillName: string;
      category: string;
      proficiency: string;
      xp: number;
      sessionsCount: number;
    }>;
    learning: Array<{
      id: string;
      skillName: string;
      category: string;
      proficiency: string;
      xp: number;
      sessionsCount: number;
    }>;
  };
  recentSessions: {
    taught: Array<{
      id: string;
      skill: string;
      learner: { displayName: string; avatarUrl?: string };
      status: string;
      createdAt: string;
      scheduledAt?: string;
    }>;
    learned: Array<{
      id: string;
      skill: string;
      teacher: { displayName: string; avatarUrl?: string };
      status: string;
      createdAt: string;
      scheduledAt?: string;
    }>;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    rarity: string;
    earnedAt: string;
  }>;
  activities: Array<{
    id: string;
    type: string;
    title: string;
    description?: string;
    createdAt: string;
    metadata?: any;
    icon: string;
    color: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    reviewer: { displayName: string; avatarUrl?: string };
    createdAt: string;
  }>;
}

interface UpcomingSession {
  id: string;
  skill: string;
  participant: {
    displayName: string;
    avatarUrl?: string;
  };
  type: "teaching" | "learning";
  scheduledAt: string;
  status: string;
  duration: number;
  notes?: string;
}

const COMMUNITY_SUGGESTIONS = [
  {
    id: "1",
    name: "Beginner Frontend Circle",
    description:
      "A supportive community for those starting their frontend journey",
    members: 245,
    avatar: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Web3 Builders",
    description: "Connect with other blockchain and Web3 enthusiasts",
    members: 180,
    avatar: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Design System Experts",
    description: "Share knowledge about design systems and UI patterns",
    members: 120,
    avatar: "/placeholder.svg",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();

  // Initialize states - start with null to show loading
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>(
    [],
  );
  const [filteredActivities, setFilteredActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const checkUserAndFetchDashboard = async () => {
      console.log(
        "State Variables - isLoaded:",
        isLoaded,
        "isSignedIn:",
        isSignedIn,
      );

      if (!isLoaded) {
        // Clerk is still loading, wait for it.
        return;
      }

      if (!isSignedIn) {
        // User is not signed in, redirect to auth page.
        router.push("/auth");
        return;
      }

      setIsLoading(true);

      try {
        // Check user status first
        const userResponse = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          console.error(
            "API Error during user check:",
            errorData.error || userResponse.statusText,
          );
          setIsLoading(false);
          return;
        }

        const userData = await userResponse.json();
        console.log(
          "User status from /api/user GET:",
          userData.user?.hasOnboarded,
        );

        // Check if user exists AND has not onboarded
        if (userData.user && userData.user.hasOnboarded === false) {
          console.log("User exists but not onboarded.");
          router.push("/onboard");
          return;
        }

        // If user is onboarded, fetch dashboard data
        if (userData.user && userData.user.hasOnboarded) {
          const dashboardResponse = await fetch("/api/dashboard", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (dashboardResponse.ok) {
            const data = await dashboardResponse.json();
            console.log("Dashboard data received:", data);
            setDashboardData(data);
            setUpcomingSessions([]); // No upcoming sessions in current implementation
          } else {
            console.error("Failed to fetch dashboard data");
          }
        }
      } catch (error: any) {
        console.error("Network or unexpected error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndFetchDashboard();
  }, [isLoaded, isSignedIn, router]);

  // Filter activities when the filter state changes
  useEffect(() => {
    if (dashboardData) {
      if (filter === "all") {
        setFilteredActivities(dashboardData.activities);
      } else {
        setFilteredActivities(
          dashboardData.activities.filter((activity) =>
            activity.type.includes(filter),
          ),
        );
      }
    }
  }, [filter, dashboardData]);

  // Helper function to get activity icon
  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case "book-open":
        return <BookOpen className="w-4 h-4" />;
      case "award":
        return <Award className="w-4 h-4" />;
      case "star":
        return <Star className="w-4 h-4" />;
      case "users":
        return <Users className="w-4 h-4" />;
      case "plus-circle":
        return <PlusCircle className="w-4 h-4" />;
      case "target":
        return <Target className="w-4 h-4" />;
      case "user-plus":
        return <UserPlus className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Tomorrow";
    if (diffDays <= 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black animate-pulse">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 font-medium">
            Unable to load dashboard data
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with User Profile Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-transparent rounded-xl border-2 border-black shadow-lg p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-black">
                <AvatarImage
                  src={dashboardData.user.avatarUrl || "/placeholder.svg"}
                  alt={dashboardData.user.displayName}
                />
                <AvatarFallback className="bg-yellow-400 text-black font-bold text-xl">
                  {dashboardData.user.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-black">
                    {dashboardData.user.displayName}
                  </h1>
                  <Badge className="bg-yellow-400 text-black font-bold">
                    <Shield className="w-3 h-3 mr-1" />
                    {dashboardData.user.reputation}
                  </Badge>
                </div>
                {dashboardData.user.username && (
                  <p className="text-gray-600 font-medium">
                    {dashboardData.user.username}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-bold text-black">
                      {dashboardData.user.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {dashboardData.user.skillsTeaching} skills taught ·{" "}
                    {dashboardData.user.skillsLearning} skills learning
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-black text-black">
                  {dashboardData.user.sessionsCompleted}
                </div>
                <div className="text-xs text-gray-600">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-black">
                  {dashboardData.user.nftCertificates}
                </div>
                <div className="text-xs text-gray-600">Badges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-black">
                  {dashboardData.user.totalXP}
                </div>
                <div className="text-xs text-gray-600">XP</div>
              </div>
              <Button
                size="sm"
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit Profile
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skill Wallet - Your Superpowers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-black shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-black font-bold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Your Superpowers
                    </CardTitle>
                    <Link href="/create-skill">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-black"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Skill
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {dashboardData.skills.teaching.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dashboardData.skills.teaching.map((skill) => (
                        <div
                          key={skill.id}
                          className="p-4 border border-gray-200 rounded-lg bg-green-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-black">
                              {skill.skillName}
                            </h3>
                            <Badge
                              variant="outline"
                              className="border-green-600 text-green-600"
                            >
                              {skill.proficiency}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {skill.category}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Progress value={skill.xp} className="w-16 h-2" />
                              <span className="text-xs text-gray-600">
                                {skill.xp} XP
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {skill.sessionsCount} sessions
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Zap className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="mb-4">No teaching skills added yet</p>
                      <Link href="/create-skill">
                        <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                          Add Your First Skill
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills You're Learning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 border-black shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-black font-bold flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      Your Learning Quest
                    </CardTitle>
                    <Link href="/skills">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-black"
                      >
                        <BookMarked className="w-4 h-4 mr-1" />
                        Browse Skills
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {dashboardData.skills.learning.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.skills.learning.map((skill) => (
                        <div
                          key={skill.id}
                          className="p-4 border border-gray-200 rounded-lg bg-blue-50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-black">
                                {skill.skillName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {skill.category}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-blue-600 text-blue-600"
                            >
                              {skill.proficiency}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-gray-600">
                                Progress:
                              </div>
                              <Progress
                                value={(skill.xp / 100) * 100}
                                className="w-24 h-2"
                              />
                              <span className="text-xs text-gray-600">
                                {skill.xp}%
                              </span>
                            </div>
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              Continue Learning
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="mb-4">No learning skills added yet</p>
                      <Link href="/skills">
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                          Explore Skills to Learn
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2 border-black shadow-lg">
                <CardHeader>
                  <CardTitle className="text-black font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    Upcoming Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingSessions.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border border-gray-300">
                                <AvatarImage
                                  src={session.participant.avatarUrl}
                                />
                                <AvatarFallback>
                                  {session.participant.displayName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-bold text-black">
                                  {session.type === "teaching"
                                    ? "Teaching"
                                    : "Learning"}{" "}
                                  {session.skill}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  with {session.participant.displayName} ·{" "}
                                  {session.duration} min
                                </p>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(session.scheduledAt)}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                Reschedule
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Join
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="mb-4">No upcoming sessions scheduled</p>
                      <Link href="/skills">
                        <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                          Book a Session
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-2 border-black shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-black font-bold flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      Recent Activity
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="all">All</option>
                        <option value="teaching">Teaching</option>
                        <option value="learning">Learning</option>
                        <option value="community">Community</option>
                        <option value="achievements">Achievements</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredActivities.length > 0 ? (
                    <div className="space-y-4">
                      {filteredActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3"
                        >
                          <div
                            className={`p-2 rounded-full ${activity.color} bg-opacity-10`}
                          >
                            {getActivityIcon(activity.icon)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-black">
                              {activity.title}
                            </p>
                            {activity.description && (
                              <p className="text-xs text-gray-600">
                                {activity.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {formatRelativeTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Reputation & NFTs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-2 border-black shadow-lg">
                <CardHeader>
                  <CardTitle className="text-black font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Reputation & Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-3xl font-black text-black">
                        {dashboardData.user.reputation}
                      </div>
                      <div className="text-sm text-gray-600">
                        Reputation Score
                      </div>
                      <Badge className="bg-yellow-400 text-black font-bold mt-2">
                        {dashboardData.user.reputation >= 80
                          ? "Expert"
                          : dashboardData.user.reputation >= 50
                            ? "Advanced"
                            : "Beginner"}{" "}
                        Level
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-bold text-black mb-3">Your Badges</h4>
                      {dashboardData.badges.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {dashboardData.badges.slice(0, 4).map((badge) => (
                            <div
                              key={badge.id}
                              className="relative group cursor-pointer"
                            >
                              <div
                                className={`aspect-square ${
                                  badge.rarity === "GOLD"
                                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                    : badge.rarity === "SILVER"
                                      ? "bg-gradient-to-br from-gray-300 to-gray-500"
                                      : "bg-gradient-to-br from-amber-600 to-amber-800"
                                } rounded-lg border-2 border-black flex items-center justify-center`}
                              >
                                <Award className="w-6 h-6 text-black" />
                              </div>
                              <p className="text-xs font-medium text-center mt-1 truncate">
                                {badge.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Award className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">
                            Complete sessions to earn badges
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Community Circle Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-2 border-black shadow-lg">
                <CardHeader>
                  <CardTitle className="text-black font-bold flex items-center gap-2">
                    <Users2 className="w-5 h-5 text-purple-500" />
                    Community Circles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {COMMUNITY_SUGGESTIONS.map((circle) => (
                      <div
                        key={circle.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={circle.avatar} />
                              <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                                {circle.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-bold text-black text-sm">
                                {circle.name}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {circle.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {circle.members} members
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Call to Action Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-2 border-black shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardHeader>
                  <CardTitle className="text-black font-bold flex items-center gap-2">
                    <Gift className="w-5 h-5 text-yellow-600" />
                    Boost Your Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-black text-sm mb-1">
                      Start Teaching
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      Share your skills and earn your first badge
                    </p>
                    <Link href="/skills">
                      <Button
                        size="sm"
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                      >
                        Find Students
                      </Button>
                    </Link>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <h4 className="font-bold text-black text-sm mb-1">
                      Complete Your Profile
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      Add more skills to unlock better matches
                    </p>
                    <Link href="/create-skill">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-blue-300 text-blue-600"
                      >
                        Update Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Settings Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-2 border-black shadow-lg">
                <CardHeader>
                  <CardTitle className="text-black font-bold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-500" />
                    Quick Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="notifications"
                      className="text-sm font-medium"
                    >
                      Notifications
                    </Label>
                    <Switch id="notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="availability"
                      className="text-sm font-medium"
                    >
                      Available for Teaching
                    </Label>
                    <Switch id="availability" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode" className="text-sm font-medium">
                      Dark Mode
                    </Label>
                    <Switch id="dark-mode" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        Wallet Connected
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-green-500 text-green-600"
                    >
                      Connected
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
