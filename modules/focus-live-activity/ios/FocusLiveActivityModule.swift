import ExpoModulesCore
import ActivityKit

public class FocusLiveActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("FocusLiveActivity")

    AsyncFunction("startLiveActivity") { (title: String, totalMinutes: Int, endTimeMillis: Double) -> String? in
      if #available(iOS 16.1, *) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return nil }
        let endTime = Date(timeIntervalSince1970: endTimeMillis / 1000.0)
        let attributes = FocusActivityAttributes(sessionID: UUID().uuidString)
        let contentState = FocusActivityAttributes.ContentState(
          title: title,
          endTime: endTime,
          totalMinutes: totalMinutes,
          isPaused: false
        )
        do {
          let activity = try Activity<FocusActivityAttributes>.request(
            attributes: attributes,
            content: .init(state: contentState, staleDate: nil)
          )
          return activity.id
        } catch {
          print("FocusLiveActivity: Error starting live activity:", error)
          return nil
        }
      }
      return nil
    }

    AsyncFunction("updateLiveActivity") { (activityId: String, isPaused: Bool, remainingSeconds: Int?) in
      if #available(iOS 16.1, *) {
        Task {
          for activity in Activity<FocusActivityAttributes>.activities where activity.id == activityId {
            var updatedState = activity.content.state
            updatedState.isPaused = isPaused
            if let rem = remainingSeconds {
              updatedState.pausedSecondsRemaining = rem
            }
            await activity.update(.init(state: updatedState, staleDate: nil))
          }
        }
      }
    }

    AsyncFunction("endLiveActivity") { (activityId: String?) in
      if #available(iOS 16.1, *) {
        Task {
          for activity in Activity<FocusActivityAttributes>.activities {
            if activityId == nil || activity.id == activityId {
              await activity.end(nil, dismissalPolicy: .immediate)
            }
          }
        }
      }
    }
  }
}
