package com.astramind.di

import androidx.room.Room
import com.astramind.data.local.AppDatabase
import com.astramind.data.repository.ChatRepository
import com.astramind.presentation.chat.ChatViewModel
import org.koin.android.ext.koin.androidContext
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.dsl.module

val appModule = module {
    // Database
    single { Room.databaseBuilder(androidContext(), AppDatabase::class.java, "astra_db").build() }
    single { get<AppDatabase>().chatDao() }
    
    // Repositories
    single { ChatRepository(get(), get()) }
    
    // ViewModels
    viewModel { ChatViewModel(get()) }
}