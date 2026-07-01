package com.astramind.presentation.chat

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Language
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle

val PremiumBlack = Color(0xFF0A0A0A)
val GlossyGold = Color(0xFFD4AF37)
val Silver = Color(0xFFC0C0C0)
val DarkGray = Color(0xFF1C1C1C)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(viewModel: ChatViewModel) {
    val messages by viewModel.messages.collectAsStateWithLifecycle(initialValue = emptyList())
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var textInput by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "AstraMind AI",
                        color = GlossyGold,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                },
                actions = {
                    IconButton(onClick = { viewModel.toggleLanguage() }) {
                        Icon(
                            Icons.Default.Language, 
                            contentDescription = "Toggle Language", 
                            tint = if (uiState.currentLanguage == "te") GlossyGold else Silver
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = PremiumBlack)
            )
        },
        containerColor = PremiumBlack
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Chat History Area
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 16.dp),
                reverseLayout = true // Pushes messages from bottom to top
            ) {
                // Reverse the list so the newest messages appear at the bottom
                items(messages.reversed()) { message ->
                    ChatBubble(
                        text = message.content,
                        isUser = message.isUser
                    )
                }
            }

            // Bottom Input Area
            ChatInputBar(
                text = textInput,
                onTextChange = { textInput = it },
                onSend = {
                    viewModel.sendMessage(textInput)
                    textInput = ""
                },
                isTyping = uiState.isTyping
            )
        }
    }
}

@Composable
fun ChatBubble(text: String, isUser: Boolean) {
    val alignment = if (isUser) Alignment.CenterEnd else Alignment.CenterStart
    val backgroundColor = if (isUser) DarkGray else PremiumBlack
    val borderColor = if (isUser) Silver.copy(alpha = 0.2f) else GlossyGold.copy(alpha = 0.8f)
    val textColor = if (isUser) Silver else Color.White

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        contentAlignment = alignment
    ) {
        Surface(
            shape = RoundedCornerShape(
                topStart = 20.dp,
                topEnd = 20.dp,
                bottomStart = if (isUser) 20.dp else 4.dp,
                bottomEnd = if (isUser) 4.dp else 20.dp
            ),
            color = backgroundColor,
            border = androidx.compose.foundation.BorderStroke(1.dp, borderColor),
            modifier = Modifier.widthIn(max = 320.dp),
            shadowElevation = if (!isUser) 4.dp else 0.dp
        ) {
            Text(
                text = text,
                color = textColor,
                modifier = Modifier.padding(14.dp),
                fontSize = 16.sp,
                lineHeight = 22.sp
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatInputBar(
    text: String,
    onTextChange: (String) -> Unit,
    onSend: () -> Unit,
    isTyping: Boolean
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkGray)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        TextField(
            value = text,
            onValueChange = onTextChange,
            modifier = Modifier.weight(1f),
            placeholder = { Text("Ask AstraMind...", color = Silver.copy(alpha = 0.5f)) },
            colors = TextFieldDefaults.textFieldColors(
                containerColor = PremiumBlack,
                cursorColor = GlossyGold,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            ),
            shape = RoundedCornerShape(24.dp),
            maxLines = 4
        )
        
        Spacer(modifier = Modifier.width(12.dp))
        
        FloatingActionButton(
            onClick = { if (text.isNotBlank()) onSend() },
            containerColor = GlossyGold,
            contentColor = PremiumBlack,
            modifier = Modifier.size(52.dp),
            elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 4.dp)
        ) {
            if (isTyping) {
                CircularProgressIndicator(color = PremiumBlack, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
            } else {
                Icon(Icons.Default.Send, contentDescription = "Send Message")
            }
        }
    }
}