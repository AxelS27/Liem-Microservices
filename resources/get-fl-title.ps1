Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public class WinEnum {
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc e, IntPtr l);
    [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint p);
    public delegate bool EnumWindowsProc(IntPtr h, IntPtr l);
    public static string FindTitle(uint procId) {
        string result = null;
        EnumWindows((hWnd, lParam) => {
            uint wPid; GetWindowThreadProcessId(hWnd, out wPid);
            if (wPid == procId) {
                var sb = new StringBuilder(512);
                if (GetWindowText(hWnd, sb, 512) > 0) {
                    string t = sb.ToString();
                    if (t.Contains(".flp - FL Studio")) { result = t; return false; }
                }
            }
            return true;
        }, IntPtr.Zero);
        return result;
    }
}
"@

$proc = Get-Process -Name FL64 -ErrorAction SilentlyContinue
if (-not $proc) { exit }
$title = [WinEnum]::FindTitle([uint32]$proc.Id)
if ($title) { Write-Output $title }
