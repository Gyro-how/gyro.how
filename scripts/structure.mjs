export const structure = [
	{
		label: 'Start here',
		dir: 'start',
		items: [
			['what-players-expect', 'What players expect'],
			['choose-your-path', 'Choose your path'],
			['checklist', 'Is your gyro done right?'],
		],
	},
	{
		label: 'Add gyro to your game',
		dir: 'add-gyro',
		items: [
			['new-project', 'New project'],
			['mature-project', 'Mature project'],
		],
	},
	{
		label: 'By game type',
		dir: 'game-types',
		items: [
			{ label: '3D', items: [['first-and-third-person', 'First-person/Third-person views']] },
			{
				label: '2D',
				items: [
					['pointer-cursor-and-top-down', 'Pointer, cursor and top-down'],
					['vehicles-and-tilt-steering', 'Vehicles & tilt steering'],
				],
			},
		],
	},
	{
		label: 'By platform',
		dir: 'platforms',
		items: [
			['pc', 'PC'],
			['consoles', 'Consoles'],
			['mobile', 'Mobile'],
		],
	},
	{
		label: 'Building blocks',
		dir: 'building-blocks',
		items: [
			['reading-the-gyro', 'Reading the gyro'],
			['gyro-as-a-camera', 'Gyro as a camera'],
			['sensitivity', 'Sensitivity'],
			['calibration', 'Calibration'],
			['turning-axis', 'Turning axis (yaw, roll, player space)'],
			['turning-gyro-on-and-off', 'Turning gyro on and off'],
			['smoothing-and-acceleration', 'Smoothing & acceleration'],
			['flick-stick', 'Flick stick'],
			['gyro-pointer', 'Gyro pointer'],
			['tilt-controls', 'Tilt controls'],
		],
	},
	{
		label: 'Mixed input (PC)',
		dir: 'mixed-input',
		items: [
			['mouse-and-controller-together', 'Mouse + controller together'],
			['button-prompts', 'Button prompts'],
			['camera-and-sensitivity-conflicts', 'Camera & sensitivity conflicts'],
			['menus-and-cursor', 'Menus & cursor'],
		],
	},
	{
		label: 'Settings',
		dir: 'settings',
		items: [
			['gyro-settings-menu', 'The gyro settings menu'],
			['default-values', 'Default values'],
			['presets', 'Presets'],
			['accessibility', 'Accessibility'],
		],
	},
	{
		label: 'Player experience',
		dir: 'player-experience',
		items: [
			['teaching-players-gyro', 'Teaching players gyro'],
			['gyro-icons-and-prompts', 'Gyro icons & prompts'],
			['menus-and-ui', 'Menus & UI'],
		],
	},
	{
		label: 'Multiplayer',
		dir: 'multiplayer',
		items: [
			['aim-assist', 'Aim assist'],
			['fairness-and-matchmaking', 'Fairness & matchmaking'],
		],
	},
	{
		label: 'Testing',
		dir: 'testing',
		items: [
			['how-to-test-gyro-controls', 'How to Test gyro controls'],
			['testing-without-a-gyro-controller', 'Testing without a gyro controller'],
			['gyro-playground', 'Gyro playground'],
		],
	},
	['troubleshooting', 'Troubleshooting'],
	{
		label: 'Resources',
		dir: 'resources',
		items: [
			{
				label: 'Tools & plugins',
				dir: 'tools-and-plugins',
				items: [
					{
						label: 'By engine',
						dir: 'engines',
						items: [
							['unreal-engine', 'Unreal Engine'],
							['unity', 'Unity'],
							['godot', 'Godot'],
							['custom-engine', 'Custom engine (in-house)'],
						],
					},
					{
						label: 'By Middleware',
						dir: 'middleware',
						items: [
							['sdl3', 'SDL3'],
							['microsoft-gameinput', 'Microsoft GameInput'],
							['steam-input-api', 'Steam Input API'],
						],
					},
				],
			},
			['platform-api-reference', 'Platform API reference'],
			['glossary', 'Glossary'],
			['further-reading', 'Further reading'],
		],
	},
];

const join = (base, part) => (base ? `${base}/${part}` : part);

const toItem = (node, base) => {
	if (Array.isArray(node)) return { label: node[1], slug: join(base, node[0]) };
	const dir = node.dir ? join(base, node.dir) : base;
	return { label: node.label, items: node.items.map((child) => toItem(child, dir)) };
};

const collect = (node, base, out) => {
	if (Array.isArray(node)) {
		out.push({ path: join(base, node[0]), title: node[1] });
		return out;
	}
	const dir = node.dir ? join(base, node.dir) : base;
	for (const child of node.items) collect(child, dir, out);
	return out;
};

export const sidebar = () => structure.map((node) => toItem(node, ''));

export const allPages = () => structure.flatMap((node) => collect(node, '', []));
