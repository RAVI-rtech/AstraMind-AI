package com.astramind.presentation.pdf

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
fun PdfScreen(viewModel: PdfViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PremiumBlack)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Document Intelligence", style = MaterialTheme.typography.headlineMedium, color = GlossyGold)
        
        Spacer(modifier = Modifier.height(32.dp))

        // Upload Placeholder
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
                .background(Color(0xFF1C1C1C), RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            Button(onClick = { /* Launch File Picker */ }, colors = ButtonDefaults.buttonColors(containerColor = GlossyGold)) {
                Text("Select PDF Document", color = PremiumBlack)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (uiState.isLoading) {
            CircularProgressIndicator(color = GlossyGold)
        } else if (uiState.summary != null) {
            Text(uiState.summary!!, color = Color.White, style = MaterialTheme.typography.bodyLarge)
        }
    }
}