
package com.example.FoodStockManagement.dto.AI;

import java.util.List;

public record AIBusinessAssistantRequest(
        String message,
        List<ChatMessage> history
) {
    public record ChatMessage(
            String role,
            String content
    ) {
    }
}
