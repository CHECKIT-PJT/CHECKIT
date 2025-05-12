import TabButton from "../../components/sequence/TapButton";

interface Category {
  id: string;
  name: string;
}

interface TabNavigationProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

/**
 * 탭 네비게이션 컴포넌트
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex px-4 pt-2 bg-gray-50 border-b">
      {categories.map((category) => (
        <TabButton
          key={category.id}
          id={category.id}
          name={category.name}
          isActive={activeCategory === category.id}
          onClick={() => onCategoryChange(category.id)}
        />
      ))}
    </div>
  );
};

export default TabNavigation;
