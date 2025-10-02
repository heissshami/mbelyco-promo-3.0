"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  Layers,
  Ticket,
  BadgeCheck,
  ShieldAlert,
  Users as UsersIcon,
  Settings as SettingsIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    { title: "Dashbold", url: "/dashboard", icon: LayoutDashboard },
    { title: "Batches", url: "/dashboard/batches", icon: Layers },
    { title: "Promo Codes", url: "/dashboard/promo-codes", icon: Ticket },
    { title: "Redemptions", url: "/dashboard/redemptions", icon: BadgeCheck },
    { title: "Frauds", url: "/dashboard/frauds", icon: ShieldAlert },
    { title: "Users", url: "/dashboard/users", icon: UsersIcon },
    { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
  ],
  projects: [
    {
      name: "Generate Codes",
      url: "/dashboard/actions/generate-codes",
      icon: GalleryVerticalEnd,
    },
    {
      name: "Download Codes",
      url: "/dashboard/actions/download-codes",
      icon: AudioWaveform,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
