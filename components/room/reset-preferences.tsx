import { Button } from "@/components/ui/button"
import { useRoom } from "@/hooks/use-room"
import { Settings } from "lucide-react"

export function ResetPreferences() {
  const { setSkipPreJoin, setLastUsedDevices, leaveRoom } = useRoom()

  const handleReset = () => {
    // Reset all preferences
    setSkipPreJoin(false)
    setLastUsedDevices(null)
    leaveRoom()
    // Force reload to ensure clean state
    window.location.reload()
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleReset}
      title="Reset Meeting Preferences"
      className="absolute top-4 right-4 z-50"
    >
      <Settings className="h-5 w-5" />
    </Button>
  )
}
