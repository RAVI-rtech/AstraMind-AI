package com.astramind.presentation.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

val PremiumBlack = Color(0xFF0A0A0A)
val GlossyGold = Color(0xFFD4AF37)

@Composable
fun SettingsScreen(viewModel: SettingsViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    var apiKey by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PremiumBlack)
            .padding(24.dp)
    ) {
        Text("Configuration", style = MaterialTheme.typography.headlineMedium, color = GlossyGold)
        
        Spacer(modifier = Modifier.height(32.dp))

        // Security Section
        Text("Security", color = Color.Gray)
        Switch(checked = uiState.isBiometricEnabled, onCheckedChange = { viewModel.toggleBiometrics(it) })
        
        Spacer(modifier = Modifier.height(16.dp))

        // Vault Section
        TextField(
            value = apiKey,
            onValueChange = { apiKey = it },
            label = { Text("API Key Vault") },
            modifier = Modifier.fillMaxWidth()
        )
        Button(onClick = { viewModel.updateApiKey(apiKey) }, colors = ButtonDefaults.buttonColors(containerColor = GlossyGold)) {
            Text("Secure Key")
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Data Section
        OutlinedButton(onClick = { /* Launch Backup */ }) {
            Text("Export Chat History", color = GlossyGold)
        }
    }
}