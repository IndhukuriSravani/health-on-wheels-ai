import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Stethoscope, User, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = "Healthcare on Wheels" }) => {
  const { user, logout } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Doctor': return 'text-primary';
      case 'Admin': return 'text-healthcare-teal';
      case 'Patient': return 'text-success';
      default: return 'text-foreground';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Doctor': return <Stethoscope className="h-4 w-4" />;
      case 'Admin': return <Settings className="h-4 w-4" />;
      case 'Patient': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Diagnostic System</p>
            </div>
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className={`text-xs ${getRoleColor(user.role)} flex items-center gap-1 justify-end`}>
                  {getRoleIcon(user.role)}
                  {user.role}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <div className={`text-xs ${getRoleColor(user.role)} flex items-center gap-1 mt-1`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                        {user.department && ` - ${user.department}`}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-danger">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};