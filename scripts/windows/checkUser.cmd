dir \\wsl.localhost\%1\home | findstr /v /s /c:"."
:: exclude directories that starts with . (so "." and "..")
