Add-Type @"
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public class WinEnum {
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc e, IntPtr l);
    [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint p);
    public delegate bool EnumWindowsProc(IntPtr h, IntPtr l);
    public static string[] FindTitles(uint[] procIds) {
        var list = new List<string>();
        var ids = new HashSet<uint>(procIds);
        EnumWindows((hWnd, lParam) => {
            uint wPid; GetWindowThreadProcessId(hWnd, out wPid);
            if (ids.Contains(wPid)) {
                var sb = new StringBuilder(512);
                if (GetWindowText(hWnd, sb, 512) > 0) {
                    string t = sb.ToString();
                    if (t.Contains(".flp - FL Studio")) {
                        list.Add(t);
                    }
                }
            }
            return true;
        }, IntPtr.Zero);
        return list.ToArray();
    }
}
"@

$processes = Get-Process | Where-Object { $_.ProcessName -eq "FL64" -or $_.ProcessName -eq "FL" }
if (-not $processes) { exit }

[uint32[]]$procIds = $processes | ForEach-Object { [uint32]$_.Id }

$titles = [WinEnum]::FindTitles($procIds)
if (-not $titles) { exit }

$real = $titles | Where-Object { $_ -notmatch 'Untitled\.flp' }
$bestTitle = if ($real) { @($real)[0] } else { $titles[0] }

if ($bestTitle) { Write-Output $bestTitle }
