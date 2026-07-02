package com.astramind.presentation.settings

import androidx.lifecycle.ViewModel
import com.astramind.data.security.VaultManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

data class SettingsUiState(
    val isBiometricEnabled: Boolean = false,
    val theme: String = "Dark",
    val autoSync: Boolean = true
)

class SettingsViewModel(private val vault: VaultManager) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState = _uiState.asStateFlow()

    fun updateApiKey(key: String) {
        vault.saveApiKey(key)
    }

    fun toggleBiometrics(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(isBiometricEnabled = enabled)
    }

    fun toggleTheme(theme: String) {
        _uiState.value = _uiState.value.copy(theme = theme)
    }
}