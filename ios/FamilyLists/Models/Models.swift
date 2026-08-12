import Foundation

enum ItemColor: String, CaseIterable, Codable, Identifiable {
    case red, orange, yellow, green, mint, blue, purple, pink
    var id: String { rawValue }
}
struct GroceryList: Codable, Identifiable, Hashable {
    let id: UUID; var name: String; let sortOrder: Int; let updatedAt: Date?
    let itemCount: Int?; let completedItemCount: Int?
}
struct ListItem: Codable, Identifiable, Hashable {
    let id: UUID; let listId: UUID; var name: String; var quantity: String?; var colorLabel: ItemColor
    let sortOrder: Int; var completedAt: Date?; let updatedAt: Date?
    var isComplete: Bool { completedAt != nil }
}
struct APIErrorEnvelope: Codable { let error: APIError }
struct APIError: Codable, Error { let code: String; let message: String }
