package com.astramind.data.remote

import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface PdfApi {
    @Multipart
    @POST("api/pdf/analyze-pdf")
    suspend fun analyzePdf(
        @Part file: MultipartBody.Part
    ): Response<com.astramind.api.PdfAnalysisResponse>
}