package com.astramind.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow
import java.util.UUID

@Entity(tableName = "chat_messages")
data class ChatMessageEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val content: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis(),
    val modelUsed: String? = null,
    val syncStatus: SyncStatus = SyncStatus.SYNCED // Added field for sync tracking
)

enum class SyncStatus {
    PENDING, SYNCED, FAILED
}

@Dao
interface ChatDao {
    @Query("SELECT * FROM chat_messages ORDER BY timestamp ASC")
    fun getChatHistory(): Flow<List<ChatMessageEntity>>

    @Query("SELECT * FROM chat_messages WHERE syncStatus = 'PENDING'")
    suspend fun getPendingMessages(): List<ChatMessageEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: ChatMessageEntity)

    @Query("UPDATE chat_messages SET content = :newContent, syncStatus = :status WHERE id = :messageId")
    suspend fun updateMessage(messageId: String, newContent: String, status: SyncStatus = SyncStatus.SYNCED)
}

@Database(entities = [ChatMessageEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun chatDao(): ChatDao
}