!include LogicLib.nsh
!include nsDialogs.nsh

!ifndef BUILD_UNINSTALLER
Var MagistraIurexaRequiredCheckbox
Var MagistraDesktopShortcutCheckbox
Var MagistraDesktopShortcutEnabled

!macro customInit
  StrCpy $MagistraDesktopShortcutEnabled ${BST_CHECKED}
!macroend

!macro customPageAfterChangeDir
  Page custom MagistraOptionsPage MagistraOptionsLeave
!macroend

Function MagistraOptionsPage
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 22u "Componenti Magistra"
  Pop $0

  ${NSD_CreateCheckbox} 0 32u 100% 12u "Installa modello locale leggero Iurexa (obbligatorio)"
  Pop $MagistraIurexaRequiredCheckbox
  ${NSD_SetState} $MagistraIurexaRequiredCheckbox ${BST_CHECKED}
  EnableWindow $MagistraIurexaRequiredCheckbox 0

  ${NSD_CreateLabel} 18u 50u 92% 34u "Magistra include il runtime Iurexa e un modello GGUF leggero per l'inferenza locale. Non richiede Ollama, Docker o un LLM gia' installato."
  Pop $0

  ${NSD_CreateCheckbox} 0 96u 100% 12u "Crea collegamento sul desktop"
  Pop $MagistraDesktopShortcutCheckbox
  ${NSD_SetState} $MagistraDesktopShortcutCheckbox $MagistraDesktopShortcutEnabled

  nsDialogs::Show
FunctionEnd

Function MagistraOptionsLeave
  ${NSD_GetState} $MagistraDesktopShortcutCheckbox $MagistraDesktopShortcutEnabled
FunctionEnd

!macro customInstall
  IfFileExists "$INSTDIR\resources\magistra-runtime\iurexa\runtime\iurexa-runtime.exe" 0 magistra_iurexa_missing
  IfFileExists "$INSTDIR\resources\magistra-runtime\iurexa\models\iurexa-lite.gguf" 0 magistra_iurexa_missing

  DetailPrint "Runtime Iurexa locale incluso nel pacchetto."

  ${If} $MagistraDesktopShortcutEnabled == ${BST_CHECKED}
    CreateShortCut "$newDesktopLink" "$appExe" "" "$appExe" 0 "" "" "${APP_DESCRIPTION}"
    ClearErrors
    WinShell::SetLnkAUMI "$newDesktopLink" "${APP_ID}"
    System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
  ${EndIf}
  Goto magistra_iurexa_done

  magistra_iurexa_missing:
    MessageBox MB_OK|MB_ICONSTOP "Il pacchetto non contiene il runtime Iurexa o il modello locale leggero.$\r$\n$\r$\nRicrea l'installer eseguendo: npm --prefix desktop run dist:win"
    Abort

  magistra_iurexa_done:
!macroend
!endif
