import SwiftUI
@main struct FamilyListsApp: App { @StateObject private var auth = AuthManager(); var body: some Scene { WindowGroup { Group { if auth.isAuthenticated { ListsView() } else { SignInView() } }.environmentObject(auth) } } }
