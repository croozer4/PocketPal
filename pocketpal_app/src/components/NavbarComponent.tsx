import cx from 'clsx';
import { useState } from 'react';
import {
    Container,
    Avatar,
    UnstyledButton,
    Group,
    Text,
    Menu,
    Tabs,
    Burger,
    rem,
    useMantineTheme,
} from '@mantine/core';
import PocketPalLogo from '../assets/pocketpal_logo.jpg';
import { useDisclosure } from '@mantine/hooks';
import {
    IconLogout,
    IconHeart,
    IconStar,
    IconMessage,
    IconSettings,
    IconPlayerPause,
    IconTrash,
    IconSwitchHorizontal,
    IconChevronDown,
} from '@tabler/icons-react';
import { createStyles } from '@mantine/core';

const user = {
    name: 'Jane Spoonfighter',
    email: 'janspoon@fighter.dev',
    image:
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80',
};

const tabs = [
    'Home',
    'Orders',
    'Education',
    'Community',
    'Forums',
    'Support',
    'Account',
    'Helpdesk',
];

const useStyles = createStyles(() => (
    {
        header: {
            paddingTop: "20px",
            backgroundColor: "rgb(255, 255, 255)",
            borderBottom: "1px solid rgb(234, 234, 234)",
            marginBottom: "120px",
        },
    }

//
// .mainSection {
//         padding-bottom: var(--mantine-spacing-sm);
//     }
//
// .user {
//         color: light-dark(var(--mantine-color-black), var(--mantine-color-dark-0));
//         padding: var(--mantine-spacing-xs) var(--mantine-spacing-sm);
//         border-radius: var(--mantine-radius-sm);
//         transition: background-color 100ms ease;
//
//     &:hover {
//             background-color: light-dark(var(--mantine-color-white), var(--mantine-color-dark-8));
//         }
//
//     @media (max-width: $mantine-breakpoint-xs) {
//             display: none;
//         }
//     }
//
// .userActive {
//         background-color: light-dark(var(--mantine-color-white), var(--mantine-color-dark-8));
//     }
//
// .tabsList {
//     &::before {
//             display: none;
//         }
//     }
//
// .tab {
//         font-weight: 500;
//         height: rem(38);
//         background-color: transparent;
//         position: relative;
//         bottom: -1px;
//
//     &:hover {
//             background-color: light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-5));
//         }
//
//     &[data-active] {
//             background-color: light-dark(var(--mantine-color-white), var(--mantine-color-dark-7));
//             border-color: light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-7));
//             border-bottom-color: transparent;
//         }
//     }
));

export function HeaderTabs() {
    const theme = useMantineTheme();
    const [opened, { toggle }] = useDisclosure(false);
    const [userMenuOpened, setUserMenuOpened] = useState(false);

    const classes = useStyles();

    const items = tabs.map((tab) => (
        <Tabs.Tab value={tab} key={tab}>
            {tab}
        </Tabs.Tab>
    ));

    return (
        <div className={classes.header}>
            <Container className={classes.mainSection} size="md">
                <Group justify="space-between">
                    <img src={PocketPalLogo} style={{ width: "100px", height: "auto"}}/>

                    <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />

                    <Menu
                        width={260}
                        position="bottom-end"
                        transitionProps={{ transition: 'pop-top-right' }}
                        onClose={() => setUserMenuOpened(false)}
                        onOpen={() => setUserMenuOpened(true)}
                        withinPortal
                    >
                        <Menu.Target>
                            <UnstyledButton
                                className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                            >
                                <Group gap={7}>
                                    <Avatar src={user.image} alt={user.name} radius="xl" size={20} />
                                    <Text fw={500} size="sm" lh={1} mr={3}>
                                        {user.name}
                                    </Text>
                                    <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                                </Group>
                            </UnstyledButton>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={
                                    <IconHeart
                                        style={{ width: rem(16), height: rem(16) }}
                                        color={theme.colors.red[6]}
                                        stroke={1.5}
                                    />
                                }
                            >
                                Liked posts
                            </Menu.Item>
                            <Menu.Item
                                leftSection={
                                    <IconStar
                                        style={{ width: rem(16), height: rem(16) }}
                                        color={theme.colors.yellow[6]}
                                        stroke={1.5}
                                    />
                                }
                            >
                                Saved posts
                            </Menu.Item>
                            <Menu.Item
                                leftSection={
                                    <IconMessage
                                        style={{ width: rem(16), height: rem(16) }}
                                        color={theme.colors.blue[6]}
                                        stroke={1.5}
                                    />
                                }
                            >
                                Your comments
                            </Menu.Item>

                            <Menu.Label>Settings</Menu.Label>
                            <Menu.Item
                                leftSection={
                                    <IconSettings style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                                }
                            >
                                Account settings
                            </Menu.Item>
                            <Menu.Item
                                leftSection={
                                    <IconSwitchHorizontal style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                                }
                            >
                                Change account
                            </Menu.Item>
                            <Menu.Item
                                leftSection={
                                    <IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                                }
                            >
                                Logout
                            </Menu.Item>

                            <Menu.Divider />

                            <Menu.Label>Danger zone</Menu.Label>
                            <Menu.Item
                                leftSection={
                                    <IconPlayerPause style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                                }
                            >
                                Pause subscription
                            </Menu.Item>
                            <Menu.Item
                                color="red"
                                leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                            >
                                Delete account
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Container>
            <Container size="md">
                <Tabs
                    defaultValue="Home"
                    variant="outline"
                    visibleFrom="sm"
                    classNames={{
                        root: classes.tabs,
                        list: classes.tabsList,
                        tab: classes.tab,
                    }}
                >
                    <Tabs.List>{items}</Tabs.List>
                </Tabs>
            </Container>
        </div>
    );
}

export default HeaderTabs;