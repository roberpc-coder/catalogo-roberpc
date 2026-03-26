[Setup]
AppName=Risk of Rain Returns - Repack by Rober®PC
AppVersion=1.0
DefaultDirName={pf}\RiskOfRainReturns
OutputDir=C:\Instaladores
OutputBaseFilename=RiskOfRainReturns_Setup
SetupIconFile=C:\Instaladores\Recursos\icono.ico
WizardImageFile=C:\Instaladores\Recursos\WizardImage.bmp
WizardStyle=modern

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Files]
Source: "GameFiles\*"; DestDir: "{app}"; Flags: external recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Risk of Rain Returns"; Filename: "{app}\Risk of Rain Returns.exe"
Name: "{commondesktop}\Risk of Rain Returns"; Filename: "{app}\Risk of Rain Returns.exe"

[Run]
Filename: "{app}\Risk of Rain Returns.exe"; Description: "Iniciar Risk of Rain Returns"; Flags: nowait postinstall skipifsilent

