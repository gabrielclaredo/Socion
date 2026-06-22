"use client"
import { useEffect } from "react"

export function ThemeInitializer() {
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark"
    document.documentElement.setAttribute("data-theme", theme)
  }, [])
  return null
}
