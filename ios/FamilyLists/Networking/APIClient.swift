import Foundation

actor APIClient {
    static let shared = APIClient()
    private let session = URLSession.shared
    private let defaults = UserDefaults.standard
    private let tokenKey = "familylists.sessionToken"
    // Set this to your HTTPS API URL in the app target's launch arguments/configuration.
    private var baseURL: URL { URL(string: defaults.string(forKey: "apiBaseURL") ?? "https://example.invalid")! }
    func setToken(_ token: String?) { defaults.set(token, forKey: tokenKey) }
    func token() -> String? { defaults.string(forKey: tokenKey) }
    func request<T: Decodable>(_ path: String, method: String = "GET", body: (any Encodable)? = nil) async throws -> T {
        var request = URLRequest(url: baseURL.appending(path: path)); request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let token = token() { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        if let body { request.httpBody = try JSONEncoder().encode(AnyEncodable(body)); request.setValue("application/json", forHTTPHeaderField: "Content-Type") }
        let (data,response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw URLError(.badServerResponse) }
        guard (200..<300).contains(http.statusCode) else { throw (try? JSONDecoder().decode(APIErrorEnvelope.self, from: data).error) ?? URLError(.badServerResponse) }
        return try JSONDecoder.family.decode(T.self, from: data)
    }
    func send(_ path: String, method: String) async throws {
        var request = URLRequest(url: baseURL.appending(path: path)); request.httpMethod = method
        if let token = token() { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        let (_,response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else { throw URLError(.badServerResponse) }
    }
}
private struct AnyEncodable: Encodable { let value: any Encodable; init(_ value: any Encodable) { self.value = value }; func encode(to encoder: Encoder) throws { try value.encode(to: encoder) } }
private extension JSONDecoder { static var family: JSONDecoder { let d = JSONDecoder(); d.keyDecodingStrategy = .convertFromSnakeCase; d.dateDecodingStrategy = .iso8601; return d } }
