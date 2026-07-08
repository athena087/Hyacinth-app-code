import { Basket, House, MagnifyingGlass, User } from 'phosphor-react-native';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { BottomNav, NavButton } from '../../components/BottomNav';

/**
 * Tab navigator with a custom floating bar. Only Home and Profile are real
 * routes (TabTriggers with hrefs); Search and Basket render as inert buttons
 * until their screens exist. TabList `asChild` hands the triggers to our
 * BottomNav pill; TabTrigger `asChild` forwards focus + press to each NavButton.
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
          <NavButton icon={MagnifyingGlass} />
          <NavButton icon={Basket} />
          <TabTrigger name="profile" href="/profile" asChild>
            <NavButton icon={User} />
          </TabTrigger>
        </BottomNav>
      </TabList>
    </Tabs>
  );
}
