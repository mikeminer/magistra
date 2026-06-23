!macro customInstall
  IfSilent magistra_llm_done

  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Vuoi installare un LLM locale leggero per Magistra?$\r$\n$\r$\nIl setup installera Ollama, se manca, e scarichera il modello llama3.2:1b.$\r$\nRichiede connessione internet e alcuni GB di spazio libero.$\r$\n$\r$\nPuoi scegliere No: Magistra funzionera comunque con il fallback citazionale e potrai installare il modello piu tardi." \
    IDNO magistra_llm_done

  DetailPrint "Installazione LLM locale leggero per Magistra..."
  ExecWait '"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\resources\install-light-llm.ps1" -Model "llama3.2:1b"' $0

  IntCmp $0 0 magistra_llm_success magistra_llm_failed magistra_llm_failed

  magistra_llm_failed:
    MessageBox MB_OK|MB_ICONEXCLAMATION \
      "Installazione del LLM locale non completata.$\r$\n$\r$\nMagistra resta utilizzabile con il fallback citazionale. Dettagli nel log: $TEMP\magistra-llm-install.log"
    Goto magistra_llm_done

  magistra_llm_success:
    MessageBox MB_OK|MB_ICONINFORMATION \
      "LLM locale leggero installato correttamente.$\r$\nMagistra usera Ollama con il modello llama3.2:1b quando disponibile."
    Goto magistra_llm_done

  magistra_llm_done:
!macroend
