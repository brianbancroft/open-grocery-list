import AuthenticationServices
import SwiftUI

@MainActor final class AuthManager: NSObject, ObservableObject {
    @Published var isAuthenticated = false
    @Published var errorMessage: String?
    override init() { super.init(); Task { isAuthenticated = await APIClient.shared.token() != nil } }
    var inviteCode: String?
    func signIn(inviteCode: String?) {
        self.inviteCode = inviteCode
        let request = ASAuthorizationAppleIDProvider().createRequest(); request.requestedScopes = [.fullName, .email]
        let controller = ASAuthorizationController(authorizationRequests: [request]); controller.delegate = self; controller.performRequests()
    }
    func signOut() { Task { try? await APIClient.shared.send("/api/auth/logout", method: "POST"); await APIClient.shared.setToken(nil); isAuthenticated = false } }
}
extension AuthManager: ASAuthorizationControllerDelegate {
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential, let data = credential.identityToken, let token = String(data: data, encoding: .utf8) else { errorMessage = "Apple did not return an identity token."; return }
        let displayName = [credential.fullName?.givenName, credential.fullName?.familyName].compactMap { $0 }.joined(separator: " ")
        Task { do { struct Payload: Encodable { let identityToken: String; let inviteCode: String?; let displayName: String? }; struct Response: Decodable { let sessionToken: String }; let response: Response = try await APIClient.shared.request("/api/auth/apple", method: "POST", body: Payload(identityToken: token, inviteCode: inviteCode, displayName: displayName.isEmpty ? nil : displayName)); await APIClient.shared.setToken(response.sessionToken); isAuthenticated = true } catch { errorMessage = (error as? APIError)?.message ?? "Could not sign in. Check your invitation and connection." } }
    }
    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) { errorMessage = error.localizedDescription }
}
