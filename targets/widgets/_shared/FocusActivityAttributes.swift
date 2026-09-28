import ActivityKit
import Foundation

public struct FocusActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var title: String
        public var endTime: Date
        public var totalMinutes: Int
        public var isPaused: Bool
        public var pausedSecondsRemaining: Int?

        public init(
            title: String,
            endTime: Date,
            totalMinutes: Int,
            isPaused: Bool,
            pausedSecondsRemaining: Int? = nil
        ) {
            self.title = title
            self.endTime = endTime
            self.totalMinutes = totalMinutes
            self.isPaused = isPaused
            self.pausedSecondsRemaining = pausedSecondsRemaining
        }
    }

    public var sessionID: String

    public init(sessionID: String) {
        self.sessionID = sessionID
    }
}
