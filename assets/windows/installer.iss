; ------------------------------------------
; Installer for Rotorflight Blackbox Viewer
; ------------------------------------------
; It receives from the command line with /D the parameters:
; version
; archName
; archAllowed
; archInstallIn64bit
; sourceFolder
; targetFolder

#define ApplicationName "Rotorflight Blackbox"
#define CompanyName "The Rotorflight open source project"
#define CompanyUrl "https://www.rotorflight.org/"
#define ExecutableFileName "rotorflight-blackbox.exe"
#define GroupName "Rotorflight"
#define InstallerFileName "rotorflight-blackbox-installer_" + version + "_" + archName
#define SourcePath "..\..\" + sourceFolder + "\rotorflight-blackbox\" + archName
#define TargetFolderName "Rotorflight-Blackbox"
#define UpdatesUrl "https://github.com/rotorflight/rotorflight-blackbox/releases/"

[CustomMessages]
LaunchProgram=Start %1

[Files]
Source: "{#SourcePath}\*"; DestDir: "{app}"; Flags: recursesubdirs

[Icons]
; Programs group
Name: "{group}\{#ApplicationName}"; Filename: "{app}\{#ExecutableFileName}";
; Desktop icon
Name: "{autodesktop}\{#ApplicationName}"; Filename: "{app}\{#ExecutableFileName}";
; Non admin users, uninstall icon
Name: "{group}\Uninstall {#ApplicationName}"; Filename: "{uninstallexe}"; Check: not IsAdminInstallMode

[Registry]
; File associations
Root: HKA; Subkey: "Software\Classes\.bbl"; ValueType: string; ValueName: ""; ValueData: "BetaflightBlackboxFile"; Flags: uninsdeletevalue
Root: HKA; Subkey: "Software\Classes\.bfl"; ValueType: string; ValueName: ""; ValueData: "BetaflightBlackboxFile"; Flags: uninsdeletevalue
Root: HKA; Subkey: "Software\Classes\BetaflightBlackboxFile"; ValueType: string; ValueName: ""; ValueData: "Betaflight Blackbox log file"; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\Classes\BetaflightBlackboxFile\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#ExecutableFileName}"
Root: HKA; Subkey: "Software\Classes\BetaflightBlackboxFile\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#ExecutableFileName}"" ""%1"""

; App registration
Root: HKA; Subkey: "Software\Classes\Applications\{#ExecutableFileName}"; ValueType: string; ValueName: "FriendlyAppName"; ValueData: "{#ApplicationName}"; Flags: uninsdeletekey

[Run]
; Add a checkbox to start the app after installed
Filename: {app}\{#ExecutableFileName}; Description: {cm:LaunchProgram, {#ApplicationName}}; Flags: nowait postinstall skipifsilent

[Setup]
AppId=33fdac19-b15b-4c6a-97ff-3a1dad32b28c
AppName={#ApplicationName}
AppPublisher={#CompanyName}
AppPublisherURL={#CompanyUrl}
AppUpdatesURL={#UpdatesUrl}
AppVersion={#version}
ArchitecturesAllowed={#archAllowed}
ArchitecturesInstallIn64BitMode={#archInstallIn64bit}
ChangesAssociations=True
Compression=lzma2
DefaultDirName={autopf}\{#GroupName}\{#TargetFolderName}
DefaultGroupName={#GroupName}\{#ApplicationName}
LicenseFile=..\..\LICENSE
MinVersion=6.2
OutputBaseFilename={#InstallerFileName}
OutputDir=..\..\{#targetFolder}\
PrivilegesRequiredOverridesAllowed=commandline dialog
SetupIconFile=rf_installer_icon.ico
SolidCompression=yes
UninstallDisplayIcon={app}\{#ExecutableFileName}
UninstallDisplayName={#ApplicationName}
WizardImageFile=rf_installer.bmp
WizardSmallImageFile=rf_installer_small.bmp
WizardStyle=modern

[Code]
function GetQuietUninstallerPath(): String;
var
    RegKey: String;
begin
    Result := '';
    RegKey := Format('%s\%s_is1', ['Software\Microsoft\Windows\CurrentVersion\Uninstall', '{#emit SetupSetting("AppId")}']);
    if not RegQueryStringValue(HKEY_LOCAL_MACHINE, RegKey, 'QuietUninstallString', Result) then
    begin
        RegQueryStringValue(HKEY_CURRENT_USER, RegKey, 'QuietUninstallString', Result);
    end;
end;

function InitializeSetup(): Boolean;
var
    ResultCode: Integer;
    ParameterStr : String;
    UninstPath : String;
begin

    Result := True;

    // Search for new Inno Setup installations
    UninstPath := GetQuietUninstallerPath();
    if UninstPath <> '' then
    begin
        if not Exec('>', UninstPath, '', SW_SHOW, ewWaitUntilTerminated, ResultCode) then
        begin
            //Result := False; // Return False to abort the installation
            MsgBox('Error uninstalling old Blackbox ' + SysErrorMessage(ResultCode) + '.', mbError, MB_OK);
        end;
    end;

end;
