package com.astramind.domain.repository

import com.astramind.data.local.ChatDao
import com.astramind.data.local.ChatMessageEntity
import com.astramind.data.remote.ChatApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader

class ChatRepository(
    private val chatDao: ChatDao,
    private val chatApi: ChatApi
) {
    // Exposes offline-first chat history directly from SQLite to the UI
    val chatHistory: Flow<List<ChatMessageEntity>> = chatDao.getChatHistory()

    suspend fun saveMessage(content: String, isUser: Boolean, modelUsed: String? = null): String {
        val entity = ChatMessageEntity(
            content = content,
            isUser = isUser,
            modelUsed = modelUsed
        )
        chatDao.insertMessage(entity)
        return entity.id
    }

    suspend fun updateMessage(id: String, newContent: String) {
        chatDao.updateMessageContent(id, newContent)
    }

    suspend fun streamAiResponse(messages: List<ChatMessageEntity>, language: String): Flow<String> = flow {
        val jsonArray = JSONArray()
        messages.forEach { msg ->
            val jsonObj = JSONObject().apply {
                put("role", if (msg.isUser) "user" else "assistant")
                put("content", msg.content)
            }
            jsonArray.put(jsonObj)
        }

        val requestBodyJson = JSONObject().apply {
            put("messages", jsonArray)
            put("language", language)
        }

        val requestBody = requestBodyJson.toString().toRequestBody("application/json".toMediaType())
    suspend fun saveMessage(content: String, isUser: Boolean, modelUsed: String? = null, status: SyncStatus = SyncStatus.SYNCED): String {
        val entity = ChatMessageEntity(
            content = content,
            isUser = isUser,
            modelUsed = modelUsed,
            syncStatus = status
        )
        chatDao.insertMessage(entity)
        return entity.id
    }

    suspend fun getPendingMessages() = chatDao.getPendingMessages()

    suspend fun syncMessageToServer(message: ChatMessageEntity) {
        // Logic to push message to backend and update status to SYNCED
        // ... call chatApi.streamChat ...
    }

    suspend fun streamAiResponse(messages: List<ChatMessageEntity>, language: String): Flow<String> = flow {
        try {
            // Check connectivity here
            // If offline, call localAiEngine.generateLocalResponse(lastMessage)
            val response = chatApi.streamChat(...) 
            // ... (rest of the streaming logic)
        } catch (e: Exception) {
            emit("⚠️ You are offline. Using local mode...")
            emitAll(localAiEngine.generateLocalResponse(messages.last().content))
        }
    }.flowOn(Dispatchers.IO)
}