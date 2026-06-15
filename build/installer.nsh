!macro customInit
  InitPluginsDir
  
  ; =========================================================================
  ; 1. Check Per-User Installation (HKCU)
  ; =========================================================================
  ReadRegStr $1 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.liem.microservices" "InstallLocation"
  ${If} $1 != ""
    ; Find the uninstaller executable
    StrCpy $0 ""
    ${If} ${FileExists} "$1\Uninstall Liem Microservices.exe"
      StrCpy $0 "$1\Uninstall Liem Microservices.exe"
    ${ElseIf} ${FileExists} "$1\Uninstall Liem Control Panel.exe"
      StrCpy $0 "$1\Uninstall Liem Control Panel.exe"
    ${EndIf}
    
    ${If} $0 != ""
      MessageBox MB_YESNO|MB_ICONQUESTION "A previous version of Liem Microservices is already installed (per-user).$\n$\nDo you want to uninstall it first? (Recommended, required to choose a new installation directory)" IDYES uninstallCurrentUser IDNO abortCurrent
      
      uninstallCurrentUser:
        ; Copy uninstaller to temp directory to allow deleting the install folder
        CopyFiles /SILENT "$0" "$PLUGINSDIR\old-uninstaller.exe"
        ; Run uninstaller interactively and wait for it
        ExecWait '"$PLUGINSDIR\old-uninstaller.exe" _?=$1' $2
        
        ; Clear installer variables so it treats it as a fresh install
        StrCpy $hasPerUserInstallation "0"
        StrCpy $perUserInstallationFolder ""
        StrCpy $INSTDIR ""
        Goto checkMachine
        
      abortCurrent:
        Quit
    ${EndIf}
  ${EndIf}

  checkMachine:
  ; =========================================================================
  ; 2. Check Per-Machine Installation (HKLM)
  ; =========================================================================
  ReadRegStr $1 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.liem.microservices" "InstallLocation"
  ${If} $1 != ""
    ; Find the uninstaller executable
    StrCpy $0 ""
    ${If} ${FileExists} "$1\Uninstall Liem Microservices.exe"
      StrCpy $0 "$1\Uninstall Liem Microservices.exe"
    ${ElseIf} ${FileExists} "$1\Uninstall Liem Control Panel.exe"
      StrCpy $0 "$1\Uninstall Liem Control Panel.exe"
    ${EndIf}
    
    ${If} $0 != ""
      MessageBox MB_YESNO|MB_ICONQUESTION "A previous version of Liem Microservices is already installed for all users.$\n$\nDo you want to uninstall it first? (Recommended, required to choose a new installation directory)" IDYES uninstallMachine IDNO abortMachine
      
      uninstallMachine:
        ; Copy uninstaller to temp directory
        CopyFiles /SILENT "$0" "$PLUGINSDIR\old-uninstaller.exe"
        ; Run uninstaller interactively and wait for it
        ExecWait '"$PLUGINSDIR\old-uninstaller.exe" _?=$1' $2
        
        StrCpy $hasPerMachineInstallation "0"
        StrCpy $perMachineInstallationFolder ""
        StrCpy $INSTDIR ""
        Goto doneCheck
        
      abortMachine:
        Quit
    ${EndIf}
  ${EndIf}
  
  doneCheck:
!macroend
