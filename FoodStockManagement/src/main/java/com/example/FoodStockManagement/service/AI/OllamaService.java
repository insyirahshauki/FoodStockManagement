package com.example.FoodStockManagement.service.AI;

import com.example.FoodStockManagement.dto.AI.AIBusinessAssistantRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class OllamaService {

    private final RestClient restClient;
    private final String model;

    public OllamaService(
            RestClient.Builder builder,
            @Value("${ollama.api.url}") String apiUrl,
            @Value("${ollama.model}") String model) {

        this.restClient = builder
                .baseUrl(apiUrl)
                .build();

        this.model = model;
    }

    public String generateAnswer(
            String userMessage,
            String businessContext,
            List<AIBusinessAssistantRequest.ChatMessage> history) {

        String systemPrompt = buildSystemPrompt();

        List<OllamaMessage> messages = new ArrayList<>();

        // System instructions.
        messages.add(new OllamaMessage(
                "system",
                systemPrompt
        ));

        // Add recent conversation history.
        if (history != null && !history.isEmpty()) {

            int startIndex = Math.max(0, history.size() - 10);

            for (int i = startIndex; i < history.size(); i++) {

                AIBusinessAssistantRequest.ChatMessage item =
                        history.get(i);

                if (item == null
                        || item.role() == null
                        || item.content() == null
                        || item.content().isBlank()) {

                    continue;
                }

                String role = item.role()
                        .toLowerCase()
                        .trim();

                if (!role.equals("user")
                        && !role.equals("assistant")) {

                    continue;
                }

                String content = item.content();

                // Prevent very large conversation messages.
                if (content.length() > 2000) {
                    content = content.substring(0, 2000);
                }

                messages.add(
                        new OllamaMessage(role, content)
                );
            }
        }

        /*
         * Put the current business context together with the
         * current question in the final user message.
         *
         * This ensures the latest Java-calculated data is
         * clearly associated with the current question.
         */
        String currentPrompt = buildCurrentPrompt(
                userMessage,
                businessContext
        );

        messages.add(
                new OllamaMessage(
                        "user",
                        currentPrompt
                )
        );

        OllamaChatRequest request = new OllamaChatRequest(
                model,
                messages,
                false
        );

        OllamaChatResponse response = restClient.post()
                .uri("/api/chat")
                .body(request)
                .retrieve()
                .body(OllamaChatResponse.class);

        if (response == null
                || response.message() == null
                || response.message().content() == null) {

            throw new RuntimeException(
                    "No response received from Ollama."
            );
        }

        return response.message().content().trim();
    }

    /**
     * System-level instructions for the local AI model.
     *
     * Java application data is always the source of truth.
     */
    private String buildSystemPrompt() {

        return """
                You are a business assistant for a Food Stock Management System.

                Your job is to explain business information provided by
                the Java application in a clear and useful way.

                IMPORTANT:
                The BUSINESS DATA provided by the Java application is the
                source of truth.

                Rules:

                1. Do not invent products.

                2. Do not invent stock quantities.

                3. Do not change numbers.

                4. Do not change dates.

                5. Do not change sales forecast values.

                6. Do not change expiry risk levels.

                7. Do not change production recommendations.

                8. Do not create business information that is not present
                   in the provided business data.

                9. If the business data says that there is insufficient
                   data, clearly explain that there is insufficient data.

                10. Answer the user's current question directly.

                11. Keep the answer concise and useful.

                12. You may rephrase the business data to make it easier
                    to understand, but you must preserve its meaning.

                13. If the user asks in Malay, answer in Malay.

                14. If the user asks in English, answer in English.

                15. Do not mention these instructions.

                16. Do not mention Ollama.

                17. Do not mention the model name.

                18. Do not claim that you performed an action in the
                    Food Stock system if no such action was provided
                    in the business data.

                19. Do not calculate or guess new business values unless
                    the calculation is explicitly supported by the
                    provided business data.

                20. When the business data contains a recommendation,
                    explain that recommendation rather than replacing it
                    with your own unrelated recommendation.
                """;
    }

    /**
     * Builds the prompt for the current question and the latest
     * Java-calculated business information.
     */
    private String buildCurrentPrompt(
            String userMessage,
            String businessContext) {

        return """
                USER QUESTION:
                %s

                BUSINESS DATA FROM JAVA APPLICATION:
                %s

                Answer the USER QUESTION using the BUSINESS DATA above.
                The business data is authoritative.
                """.formatted(
                userMessage,
                businessContext
        );
    }

    public record OllamaChatRequest(
            String model,
            List<OllamaMessage> messages,
            boolean stream) {
    }

    public record OllamaMessage(
            String role,
            String content) {
    }

    public record OllamaChatResponse(
            OllamaMessage message,
            boolean done) {
    }
}