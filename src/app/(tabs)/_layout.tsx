import { Basket, House, MagnifyingGlass, User } from 'phosphor-react-native';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { BottomNav, NavButton } from '../../components/BottomNav';

/**
 * Tab navigator with a custom floating bar. Home, Search and Profile are real
 * routes (TabTriggers with hrefs); Basket renders as an inert button until its
 * screen exists. TabList `asChild` hands the triggers to our BottomNav pill;
 * TabTrigger `asChild` forwards focus + press to each NavButton.
 */
export default function TabsLayout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <BottomNav>
          <TabTrigger name="home" href="/" asChild>
            <NavButton icon={House} />
          </TabTrigger>
          <TabTrigger name="search" href="/search" asChild>
            <NavButton icon={MagnifyingGlass} />
          </TabTrigger>
          <NavButton icon={Basket} />
          <TabTrigger name="profile" href="/profile" asChild>
            <NavButton icon={User} />
          </TabTrigger>
        </BottomNav>
      </TabList>
    </Tabs>
  );
}
