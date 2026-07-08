import { Basket, House, MagnifyingGlass, User } from 'phosphor-react-native';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { BottomNav, NavButton } from '../../components/BottomNav';

/**
 * Tab navigator with a custom floating bar. All four tabs — Home, Search, Bag
 * and Profile — are real routes (TabTriggers with hrefs). TabList `asChild`
 * hands the triggers to our BottomNav pill; TabTrigger `asChild` forwards focus
 * + press to each NavButton.
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
          <TabTrigger name="bag" href="/bag" asChild>
            <NavButton icon={Basket} />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <NavButton icon={User} />
          </TabTrigger>
        </BottomNav>
      </TabList>
    </Tabs>
  );
}
