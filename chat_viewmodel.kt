package com.astramind.presentation.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astramind.domain.repository.ChatRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

data class ChatUiState(
    val isTyping: Boolean = false,
    val currentLanguage: String = "en" // Supports English & Telugu
)

class ChatViewModel(private val repository: ChatRepository) : ViewModel() {

    val messages = repository.chatHistory

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    fun sendMessage(content: String) {
        if (content.isBlank()) return

        viewModelScope.launch {
            // 1. Immediately cache user message locally (Offline Support)
            repository.saveMessage(content, isUser = true)
            _uiState.value = _uiState.value.copy(isTyping = true)

            // 2. Create placeholder in DB for the incoming AI stream
            val aiMessageId = repository.saveMessage("", isUser = false)
            var fullAiResponse = ""

            // 3. Fetch the latest history to send as context to the API
            val history = repository.chatHistory.first() 

            // 4. Collect stream chunks and update Room DB in real-time
            repository.streamAiResponse(history, _uiState.value.currentLanguage).collect { chunk ->
                fullAiResponse += chunk
                repository.updateMessage(aiMessageId, fullAiResponse)
            }

            _uiState.value = _uiState.value.copy(isTyping = false)
        }
    }

    fun toggleLanguage() {
        val newLang = if (_uiState.value.currentLanguage == "en") "te" else "en"
        _uiState.value = _uiState.value.copy(currentLanguage = newLang)
    }
}