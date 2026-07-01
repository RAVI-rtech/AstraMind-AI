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

        try {
            val response = chatApi.streamChat(requestBody)
            if (response.isSuccessful) {
                val stream = response.body()?.byteStream()
                stream?.let {
                    val reader = BufferedReader(InputStreamReader(it))
                    var line: String?
                    while (reader.readLine().also { l -> line = l } != null) {
                        if (line!!.startsWith("data: ")) {
                            val data = line!!.removePrefix("data: ")
                            if (data == "[DONE]") break
                            
                            val json = JSONObject(data)
                            if (json.has("content")) {
                                emit(json.getString("content"))
                            }
                        }
                    }
                }
            } else {
                emit("Error: Could not connect to AI server. Please check your connection.")
            }
        } catch (e: Exception) {
            // Offline fallback: The app works completely offline to view history, 
            // and saves the prompt in DB to be sent when reconnected.
            emit("⚠️ You are offline. AstraMind saved your prompt and will sync when connected.")
        }
    }.flowOn(Dispatchers.IO)
}