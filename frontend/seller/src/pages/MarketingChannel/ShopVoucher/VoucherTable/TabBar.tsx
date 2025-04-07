import React from "react";

interface TabBarProps {
  tabs: string[];
  selectedTab: string;
  onTabClick: (tabName: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  selectedTab,
  onTabClick,
}) => {
  return (
    <div className="voucher-manage-menu mb-3">
      <ul className="stardust-tabs-header flex">
        {tabs.map((tab) => (
          <li
            key={tab}
            className={`stardust-tabs-header__tab ${
              selectedTab === tab
                ? "stardust-tabs-header__tabactive border-transparent border-2 border-b-orange-600 !text-orange-600"
                : ""
            }`}
            onClick={() => onTabClick(tab)}
          >
            <div className="flex flex-grow">
              <div className="flex flex-grow items-center justify-center">
                {tab}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};