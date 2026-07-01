package com.astramind.data.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.astramind.domain.repository.ChatRepository
import org.koin.java.KoinJavaComponent.inject

class SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {

    private val repository: ChatRepository by inject(ChatRepository::class.java)

    override suspend fun doWork(): Result {
        val pending = repository.getPendingMessages()
        if (pending.isEmpty()) return Result.success()

        return try {
            pending.forEach { message ->
                repository.syncMessageToServer(message)
            }
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}