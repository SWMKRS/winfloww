import { useState, useRef, useEffect } from 'react';

import chevronIcon from '../assets/icons/chevron.png';
import './CustomMenu.css';

function CustomMenuItem({ item, isActive, isChildActive, selectedKey, onClick, level = 0, collapsed, className = '' }) {
  /**
   * Renders a menu item with optional submenu expansion.
   */
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 70 });
  const menuItemRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren && !collapsed) {
      setIsOpen(!isOpen);
    } else if (!hasChildren) {
      onClick(item.key);
    }
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsHovered(true);
    if (collapsed && hasChildren && level === 0 && menuItemRef.current) {
      const rect = menuItemRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.top,
        left: rect.right - 8
      });
      setShowPopup(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (collapsed && hasChildren && level === 0) {
      closeTimeoutRef.current = setTimeout(() => {
        setShowPopup(false);
      }, 100);
    }
  };

  const handlePopupMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsHovered(false);
  };

  const handlePopupMouseLeave = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const paddingLeft = level === 0 ? 4 : 20;
  const isSelected = isActive || isChildActive;
  // handle icon rendering with hover state
  let displayIcon = item.icon;
  if (item.iconData) {
    const { iconActive, iconInactive, iconHover } = item.iconData;
    const currentIcon = isSelected ? (iconActive || iconHover || iconInactive) : (isHovered ? (iconHover || iconInactive) : iconInactive);
    displayIcon = <img src={currentIcon} alt='' style={{ width: 28, height: 28 }} />;
  }

  return (
    <div className='menu-item-wrapper' style={{ position: 'relative' }}>
      <div
        ref={menuItemRef}
        className={`menu-item ${isSelected ? 'active' : ''} ${collapsed ? 'collapsed' : ''} ${className}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={collapsed ? {} : { marginLeft: `${paddingLeft}px` }}
      >
        {displayIcon && <span className='item-icon'>{displayIcon}</span>}
        {!collapsed && <span className='item-label'>{item.label}</span>}
        {!collapsed && item.badge && <span className='item-badge'>{item.badge}</span>}
        {!collapsed && item.leavePageIcon && (
            <div style={{ backgroundColor: '#e1e1e1', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '25%', marginLeft: '4px' }}>
                <img
                    src={item.leavePageIcon}
                    alt=''
                    className='item-leave-page-icon'
                    style={{ width: 18, height: 18 }}
                />
            </div>
        )}
        {!collapsed && hasChildren && (
          <img
            src={chevronIcon}
            alt=''
            className={`item-arrow ${isOpen ? 'open' : ''}`}
          />
        )}
      </div>

      {hasChildren && isOpen && !collapsed && (
        <div className='submenu'>
          {item.children.map(child => {
            const childIsActive = selectedKey === child.key;
            return (
              <CustomMenuItem
                key={child.key}
                item={child}
                isActive={childIsActive}
                isChildActive={false}
                selectedKey={selectedKey}
                onClick={onClick}
                level={level + 1}
                collapsed={collapsed}
              />
            );
          })}
        </div>
      )}

      {hasChildren && collapsed && showPopup && level === 0 && (
        <div
          className='collapsed-submenu-popup'
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
          style={{
            position: 'fixed',
            left: `${popupPosition.left}px`,
            top: `${popupPosition.top}px`,
            background: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '200px',
            padding: '8px',
            zIndex: 9999
          }}
        >
          {item.children.map(child => {
            const PopupChild = () => {
              const [childHovered, setChildHovered] = useState(false);
              const childIsActive = selectedKey === child.key;
              let childIcon = null;
              if (child.iconData) {
                const { iconActive, iconInactive, iconHover } = child.iconData;
                const iconSrc = childIsActive ? (iconActive || iconHover || iconInactive) : (childHovered ? (iconHover || iconInactive) : iconInactive);
                childIcon = <img src={iconSrc} alt='' style={{ width: 28, height: 28 }} />;
              }
              return (
                <div
                  key={child.key}
                  className={`menu-item ${childIsActive ? 'active' : ''}`}
                  style={{ marginLeft: '0px' }}
                  onClick={() => {
                    onClick(child.key);
                    setShowPopup(false);
                  }}
                  onMouseEnter={() => setChildHovered(true)}
                  onMouseLeave={() => setChildHovered(false)}
                >
                  {childIcon && <span className='item-icon'>{childIcon}</span>}
                  <span className='item-label'>{child.label}</span>
                </div>
              );
            };
            return <PopupChild key={child.key} />;
          })}
        </div>
      )}
    </div>
  );
}

function CustomMenu({ items, selectedKey, onClick, collapsed = false }) {
  /**
   * Custom menu component with full control over styling and behavior.
   */
  return (
    <div className='custom-menu'>
      {items.map(item => {
        if (item.type === 'divider') {
          return <div key={item.key} className='menu-divider' />;
        }

        const isActive = selectedKey === item.key;
        const isChildActive = item.children && item.children.some(child => selectedKey === child.key);

        return (
          <CustomMenuItem
            key={item.key}
            className={item.className || ''}
            item={item}
            isActive={isActive}
            isChildActive={isChildActive}
            selectedKey={selectedKey}
            onClick={onClick}
            collapsed={collapsed}
          />
        );
      })}
    </div>
  );
}

export default CustomMenu;
