import ActivityKit
import WidgetKit
import SwiftUI

@main
struct FocusWidgetBundle: WidgetBundle {
    var body: some Widget {
        FocusActivityWidget()
    }
}

@available(iOS 16.1, *)
struct FocusActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: FocusActivityAttributes.self) { context in
            // Vista de Pantalla de Bloqueo (Lock Screen Live Activity)
            LockScreenLiveActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // 1. Dynamic Island Expandida (Al mantener pulsada la isla en el iPhone)
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 6) {
                        Image(systemName: "flame.fill")
                            .foregroundColor(Color(red: 1.0, green: 0.35, blue: 0.12))
                        Text(context.state.title.isEmpty ? "Enfoque" : context.state.title)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.white)
                            .lineLimit(1)
                    }
                    .padding(.leading, 8)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    if context.state.isPaused {
                        Text("PAUSA")
                            .font(.system(size: 12, weight: .black))
                            .foregroundColor(.gray)
                            .padding(.trailing, 8)
                    } else {
                        Text(timerInterval: Date()...context.state.endTime, countsDown: true)
                            .font(.system(size: 15, weight: .black, design: .monospaced))
                            .foregroundColor(Color(red: 1.0, green: 0.35, blue: 0.12))
                            .padding(.trailing, 8)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Text("\(context.state.totalMinutes) min objetivo")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("Modo Bestia")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(Color(red: 0.54, green: 0.48, blue: 1.0))
                    }
                    .padding(.horizontal, 10)
                    .padding(.top, 4)
                }
            } compactLeading: {
                // 2. Dynamic Island Compacta Izquierda (Llama ardiente naranja)
                HStack(spacing: 3) {
                    Image(systemName: "flame.fill")
                        .font(.system(size: 12))
                        .foregroundColor(Color(red: 1.0, green: 0.35, blue: 0.12))
                }
                .padding(.leading, 4)
            } compactTrailing: {
                // 3. Dynamic Island Compacta Derecha (Temporizador regresivo del sistema)
                if context.state.isPaused {
                    Text("II")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.gray)
                        .padding(.trailing, 4)
                } else {
                    Text(timerInterval: Date()...context.state.endTime, countsDown: true)
                        .font(.system(size: 12, weight: .black, design: .monospaced))
                        .foregroundColor(Color(red: 1.0, green: 0.35, blue: 0.12))
                        .frame(width: 44)
                        .padding(.trailing, 4)
                }
            } minimal: {
                // 4. Dynamic Island Minimal (Cuando hay otra actividad compartiendo la isla)
                Image(systemName: "flame.fill")
                    .foregroundColor(Color(red: 1.0, green: 0.35, blue: 0.12))
            }
        }
    }
}

@available(iOS 16.1, *)
struct LockScreenLiveActivityView: View {
    let context: ActivityViewContext<FocusActivityAttributes>

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color(red: 0.1, green: 0.1, blue: 0.14))
                    .frame(width: 44, height: 44)
                Image(systemName: "flame.fill")
                    .font(.system(size: 20))
                    .foregroundColor(Color(red: 1.0, green: 0.35, blue: 0.12))
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(context.state.title.isEmpty ? "Sesión de Enfoque" : context.state.title)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
                Text("Disciplina Diaria")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.gray)
            }

            Spacer()

            if context.state.isPaused {
                Text("EN PAUSA")
                    .font(.system(size: 14, weight: .black))
                    .foregroundColor(.gray)
            } else {
                Text(timerInterval: Date()...context.state.endTime, countsDown: true)
                    .font(.system(size: 20, weight: .black, design: .monospaced))
                    .foregroundColor(Color(red: 1.0, green: 0.35, blue: 0.12))
            }
        }
        .padding(16)
        .background(Color(red: 0.05, green: 0.05, blue: 0.08))
    }
}
