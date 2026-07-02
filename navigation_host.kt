package com.astramind.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.astramind.presentation.chat.ChatScreen
import com.astramind.presentation.settings.SettingsScreen
import com.astramind.presentation.vision.VisionScreen
import com.astramind.presentation.pdf.PdfScreen

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    NavHost(navController, startDestination = "chat") {
        composable("chat") { ChatScreen(org.koin.androidx.compose.koinViewModel()) }
        composable("vision") { VisionScreen() }
        composable("pdf") { PdfScreen() }
        composable("settings") { SettingsScreen() }
    }
}