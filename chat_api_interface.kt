package com.astramind.data.remote

import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Streaming

interface ChatApi {
    @Streaming // CRITICAL: Tells Retrofit not to load the entire response into memory
    @POST("api/chat/stream")
    suspend fun streamChat(
        @Body request: RequestBody
    ): Response<ResponseBody>
}