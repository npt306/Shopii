interface LinkItem {
  text: string;
  href?: string; // Optional for external links
  component?: React.ReactNode; // Optional for component switching
}

export const DropdownItem = ({
  title,
  imageSrc,
  links,
  setActiveComponent,
  isOpen,
  onToggle,
}: {
  title: string;
  imageSrc: string;
  links: LinkItem[];
  setActiveComponent: (component: React.ReactNode) => void;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className={`stardust-dropdown ${isOpen ? "open" : ""}`}>
      
      {/* Dropdown Header */}
      <div className="stardust-dropdown-item-header" onClick={onToggle}>
        <div className="user-menu-header">
          <div className="user-menu-header-icon">
            <img src={imageSrc} alt={title} />
          </div>
          <div className="leading-4">
            <span className="mr-2">{title}</span>
          </div>
        </div>
      </div>

      {/* Dropdown Body */}
      {isOpen && (
        <div className="stardust-dropdown-item-body">
          <div className="ps-8 pb-1">
            {links.map((link, index) => (
              <div
                key={index}
                className="menu-items"
                onClick={() => {
                  if (link.href) {
                    window.location.href = link.href; // Navigate to external link
                  } else if (link.component) {
                    setActiveComponent(link.component); // Switch component
                  }
                  document.title = link.text;
                }}
              >
                <span className="capitalize">{link.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};