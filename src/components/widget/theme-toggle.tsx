'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
	const { setTheme, theme } = useTheme();

	return (
		<Dropdown>
			<DropdownTrigger>
				<Button variant='faded' size='sm' className='gap-2'>
					<Sun className='dark:-rotate-90 h-4 w-4 rotate-0 scale-100 transition-all dark:scale-0' />
					<Moon className='absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
					<span className='sr-only'>Toggle theme</span>
				</Button>
			</DropdownTrigger>
			<DropdownMenu variant='faded' aria-label='Website Theme Mode'>
				<DropdownItem
					key='light'
					onPress={() => setTheme('light')}
					startContent={<Sun className='h-4 w-4' />}
					className={theme === 'light' ? 'bg-accent' : ''}
				>
					Light
				</DropdownItem>
				<DropdownItem
					key='dark'
					startContent={<Moon className='h-4 w-4' />}
					onPress={() => setTheme('dark')}
					className={theme === 'dark' ? 'bg-accent' : ''}
				>
					Dark
				</DropdownItem>
				<DropdownItem
					startContent={<Monitor className='h-4 w-4' />}
					key='system'
					onPress={() => setTheme('system')}
					className={theme === 'system' ? 'bg-accent' : ''}
				>
					System
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}
