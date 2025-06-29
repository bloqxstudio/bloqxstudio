import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getUserWordPressSites } from '@/core/api/wordpress-sites';
import { useAuth } from '@/features/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Component, Layers, Bot, Video, Globe, MoreVertical, UserCircle, Database, Settings, Shield, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
interface MainSidebarProps {
  selectedSite?: string | null;
  onSiteChange?: (site: string | null) => void;
}
export const MainSidebar = ({
  selectedSite = null,
  onSiteChange = () => {}
}: MainSidebarProps) => {
  const {
    user,
    isAdmin,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const {
    setOpenMobile
  } = useSidebar();

  // Fetch WordPress sites
  const {
    data: sites = [],
    isLoading: sitesLoading
  } = useQuery({
    queryKey: ['wordpress-sites'],
    queryFn: getUserWordPressSites,
    staleTime: 15 * 60 * 1000
  });
  const handleSiteSelect = (siteId: string) => {
    onSiteChange(selectedSite === siteId ? null : siteId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  const handleAllComponentsClick = () => {
    onSiteChange(null);
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  const handleNavigationClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
    navigate('/');
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  const isActive = (path: string) => location.pathname === path;

  // Get user display name and avatar
  const displayName = user?.email ? user.email.split('@')[0] : 'Usuário';
  const emailInitial = user?.email ? user.email[0].toUpperCase() : 'U';

  // Calculate component counts
  const getTotalSiteComponents = () => {
    return sites.reduce((total, site) => total + (site.component_count || 0), 0);
  };
  return <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <Link to="/components" onClick={handleNavigationClick} className="flex items-center">
            <svg width="100" height="28" viewBox="0 0 939 268" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-[120px] md:h-[34px]">
              <rect y="0.484375" width="264.83" height="267.205" rx="22.1681" fill="#D2F525" />
              <path d="M140.958 139.398C137.052 143.226 129.338 146.357 123.814 146.357H67.9592C62.4357 146.357 61.1118 143.226 65.0175 139.398L126.148 79.481C130.054 75.6527 137.768 72.52 143.291 72.52H199.147C204.67 72.52 205.994 75.6527 202.088 79.481L140.958 139.398Z" fill="#282828" />
              <path d="M140.873 192.197C136.968 196.026 129.253 199.158 123.73 199.158H67.8747C62.3513 199.158 61.0273 196.026 64.933 192.197L126.061 132.28C129.967 128.452 137.681 125.321 143.205 125.321H199.06C204.584 125.321 205.907 128.452 202.002 132.28L140.873 192.197Z" fill="#282828" />
              <path d="M387.443 124.595C380.847 124.595 374.867 123.495 369.502 121.297C364.226 119.01 360.048 115.668 356.97 111.271C353.892 106.874 352.221 101.465 351.958 95.0455H373.064C373.152 97.5959 373.812 99.8385 375.043 101.773C376.274 103.708 377.945 105.247 380.056 106.39C382.166 107.446 384.629 107.973 387.443 107.973C389.818 107.973 391.884 107.622 393.643 106.918C395.49 106.126 396.941 105.027 397.996 103.62C399.052 102.125 399.579 100.278 399.579 98.0796C399.579 95.793 398.964 93.8583 397.732 92.2753C396.501 90.6044 394.83 89.1972 392.72 88.054C390.609 86.8228 388.147 85.7235 385.332 84.7561C382.606 83.7007 379.66 82.6894 376.494 81.722C369.195 79.3475 363.566 76.1376 359.609 72.0921C355.739 68.0467 353.804 62.6382 353.804 55.8665C353.804 50.238 355.168 45.4451 357.894 41.4876C360.708 37.4422 364.534 34.3642 369.371 32.2535C374.207 30.1428 379.704 29.0875 385.86 29.0875C392.192 29.0875 397.776 30.1868 402.613 32.3854C407.45 34.4961 411.276 37.6181 414.09 41.7514C416.904 45.7969 418.399 50.6338 418.575 56.2622H397.337C397.249 54.3274 396.677 52.5686 395.622 50.9856C394.654 49.4026 393.291 48.1274 391.532 47.16C389.861 46.1926 387.883 45.7089 385.596 45.7089C383.573 45.621 381.727 45.9288 380.056 46.6323C378.473 47.2479 377.154 48.2593 376.098 49.6664C375.131 50.9856 374.647 52.6565 374.647 54.6792C374.647 56.614 375.131 58.3289 376.098 59.8239C377.154 61.231 378.561 62.4623 380.32 63.5176C382.166 64.485 384.277 65.4084 386.652 66.2878C389.114 67.1673 391.796 68.0467 394.698 68.9261C399.359 70.5091 403.625 72.3999 407.494 74.5985C411.452 76.7092 414.618 79.5234 416.992 83.0412C419.455 86.471 420.686 91.0441 420.686 96.7604C420.686 101.773 419.367 106.39 416.728 110.612C414.178 114.833 410.44 118.219 405.516 120.769C400.679 123.32 394.654 124.595 387.443 124.595ZM457.138 124.595C451.598 124.595 446.892 123.451 443.023 121.165C439.241 118.878 436.339 115.536 434.317 111.139C432.382 106.654 431.414 101.202 431.414 94.7817V56.526H451.202V92.8029C451.202 97.7278 452.213 101.509 454.236 104.148C456.259 106.698 459.512 107.973 463.998 107.973C466.724 107.973 469.142 107.358 471.253 106.126C473.452 104.895 475.123 103.092 476.266 100.718C477.497 98.3434 478.113 95.4413 478.113 92.0115V56.526H497.9V123.012H480.619L479.036 112.458C477.101 116.064 474.287 119.01 470.593 121.297C466.9 123.495 462.415 124.595 457.138 124.595ZM511.739 152.033V56.526H529.284L531.526 65.2325C532.933 63.3857 534.56 61.6708 536.407 60.0878C538.254 58.5048 540.453 57.2736 543.003 56.3941C545.641 55.4267 548.719 54.9431 552.237 54.9431C558.393 54.9431 563.802 56.4821 568.463 59.5601C573.212 62.6382 576.993 66.8155 579.808 72.0921C582.622 77.2808 584.029 83.2171 584.029 89.9008C584.029 96.5845 582.578 102.565 579.676 107.841C576.861 113.03 573.08 117.119 568.331 120.11C563.582 123.1 558.261 124.595 552.369 124.595C547.62 124.595 543.531 123.759 540.101 122.088C536.671 120.417 533.813 118.087 531.526 115.097V152.033H511.739ZM547.356 107.314C550.522 107.314 553.336 106.61 555.799 105.203C558.349 103.708 560.328 101.641 561.735 99.003C563.142 96.3647 563.846 93.3306 563.846 89.9008C563.846 86.471 563.142 83.4369 561.735 80.7986C560.328 78.1603 558.349 76.0936 555.799 74.5985C553.336 73.0155 550.522 72.2241 547.356 72.2241C544.102 72.2241 541.2 73.0155 538.65 74.5985C536.187 76.0936 534.253 78.1603 532.845 80.7986C531.438 83.4369 530.735 86.427 530.735 89.7689C530.735 93.1987 531.438 96.2328 532.845 98.8711C534.253 101.509 536.187 103.576 538.65 105.071C541.2 106.566 544.102 107.314 547.356 107.314ZM628.628 124.595C621.768 124.595 615.744 123.188 610.555 120.373C605.367 117.471 601.277 113.47 598.287 108.369C595.385 103.18 593.934 97.2441 593.934 90.5604C593.934 83.7007 595.385 77.5886 598.287 72.2241C601.189 66.8595 605.235 62.6382 610.423 59.5601C615.612 56.4821 621.636 54.9431 628.496 54.9431C635.18 54.9431 641.028 56.3941 646.041 59.2963C651.053 62.1984 654.967 66.1559 657.781 71.1687C660.683 76.0936 662.134 81.8099 662.134 88.3178C662.134 89.1972 662.09 90.2086 662.003 91.3519C662.003 92.4072 661.915 93.5065 661.739 94.6498H608.049V83.1731H641.951C641.775 79.4794 640.412 76.5333 637.862 74.3347C635.399 72.0482 632.321 70.9049 628.628 70.9049C625.814 70.9049 623.263 71.5645 620.977 72.8836C618.69 74.2028 616.843 76.1815 615.436 78.8199C614.117 81.4582 613.457 84.8 613.457 88.8455V92.8029C613.457 95.881 614.029 98.6073 615.172 100.982C616.404 103.356 618.118 105.203 620.317 106.522C622.604 107.841 625.286 108.501 628.364 108.501C631.266 108.501 633.641 107.929 635.487 106.786C637.422 105.555 638.917 104.016 639.973 102.169H660.156C658.924 106.39 656.814 110.216 653.824 113.646C650.834 116.988 647.184 119.67 642.875 121.693C638.565 123.627 633.816 124.595 628.628 124.595ZM673.387 123.012V56.526H690.932L692.779 68.6623C694.538 65.8481 696.605 63.4296 698.979 61.4069C701.354 59.3842 704.08 57.8012 707.158 56.658C710.324 55.5147 713.71 54.9431 717.316 54.9431V75.9177H710.72C708.081 75.9177 705.663 76.2255 703.464 76.8411C701.354 77.3688 699.507 78.2922 697.924 79.6113C696.429 80.9305 695.242 82.7334 694.362 85.0199C693.571 87.2185 693.175 89.9887 693.175 93.3306V123.012H673.387ZM354.992 242.012V149.671H416.86V165.632H374.779V187.398H412.903V202.701H374.779V226.05H416.86V242.012H354.992ZM428.982 242.012V147.032H448.77V242.012H428.982ZM495.372 243.595C488.512 243.595 482.488 242.188 477.299 239.373C472.111 236.471 468.021 232.47 465.031 227.369C462.129 222.18 460.678 216.244 460.678 209.56C460.678 202.701 462.129 196.589 465.031 191.224C467.933 185.859 471.979 181.638 477.168 178.56C482.356 175.482 488.38 173.943 495.24 173.943C501.924 173.943 507.772 175.394 512.785 178.296C517.798 181.198 521.711 185.156 524.525 190.169C527.428 195.094 528.879 200.81 528.879 207.318C528.879 208.197 528.835 209.209 528.747 210.352C528.747 211.407 528.659 212.507 528.483 213.65H474.793V202.173H508.695C508.52 198.479 507.156 195.533 504.606 193.335C502.144 191.048 499.066 189.905 495.372 189.905C492.558 189.905 490.007 190.564 487.721 191.884C485.434 193.203 483.587 195.182 482.18 197.82C480.861 200.458 480.202 203.8 480.202 207.845V211.803C480.202 214.881 480.773 217.607 481.917 219.982C483.148 222.356 484.863 224.203 487.061 225.522C489.348 226.841 492.03 227.501 495.108 227.501C498.01 227.501 500.385 226.929 502.232 225.786C504.166 224.555 505.661 223.016 506.717 221.169H526.9C525.669 225.39 523.558 229.216 520.568 232.646C517.578 235.988 513.928 238.67 509.619 240.693C505.31 242.627 500.561 243.595 495.372 243.595ZM540.132 242.012V175.526H557.413L559.128 184.101C561.238 181.023 564.009 178.56 567.438 176.713C570.956 174.866 575.002 173.943 579.575 173.943C582.829 173.943 585.775 174.383 588.413 175.262C591.051 176.054 593.382 177.285 595.405 178.956C597.427 180.539 599.098 182.562 600.417 185.024C602.968 181.594 606.222 178.912 610.179 176.977C614.137 174.954 618.446 173.943 623.107 173.943C629.087 173.943 634.012 175.13 637.881 177.505C641.839 179.879 644.785 183.309 646.72 187.794C648.655 192.279 649.622 197.732 649.622 204.152V242.012H629.967V205.867C629.967 201.03 628.999 197.292 627.064 194.654C625.218 191.928 622.227 190.564 618.094 190.564C615.456 190.564 613.125 191.224 611.103 192.543C609.08 193.862 607.497 195.709 606.354 198.084C605.298 200.458 604.771 203.316 604.771 206.658V242.012H585.115V205.867C585.115 201.03 584.148 197.292 582.213 194.654C580.278 191.928 577.156 190.564 572.847 190.564C570.384 190.564 568.142 191.224 566.119 192.543C564.184 193.862 562.645 195.709 561.502 198.084C560.447 200.458 559.919 203.316 559.919 206.658V242.012H540.132ZM695.539 243.595C688.679 243.595 682.655 242.188 677.467 239.373C672.278 236.471 668.188 232.47 665.198 227.369C662.296 222.18 660.845 216.244 660.845 209.56C660.845 202.701 662.296 196.589 665.198 191.224C668.101 185.859 672.146 181.638 677.335 178.56C682.523 175.482 688.548 173.943 695.407 173.943C702.091 173.943 707.939 175.394 712.952 178.296C717.965 181.198 721.878 185.156 724.693 190.169C727.595 195.094 729.046 200.81 729.046 207.318C729.046 208.197 729.002 209.209 728.914 210.352C728.914 211.407 728.826 212.507 728.65 213.65H674.96V202.173H708.863C708.687 198.479 707.324 195.533 704.773 193.335C702.311 191.048 699.233 189.905 695.539 189.905C692.725 189.905 690.174 190.564 687.888 191.884C685.601 193.203 683.755 195.182 682.347 197.82C681.028 200.458 680.369 203.8 680.369 207.845V211.803C680.369 214.881 680.94 217.607 682.084 219.982C683.315 222.356 685.03 224.203 687.228 225.522C689.515 226.841 692.197 227.501 695.275 227.501C698.177 227.501 700.552 226.929 702.399 225.786C704.333 224.555 705.829 223.016 706.884 221.169H727.067C725.836 225.39 723.725 229.216 720.735 232.646C717.745 235.988 714.095 238.67 709.786 240.693C705.477 242.627 700.728 243.595 695.539 243.595ZM740.299 242.012V175.526H757.58L759.163 186.211C761.185 182.518 764.044 179.571 767.737 177.373C771.431 175.086 775.916 173.943 781.193 173.943C786.733 173.943 791.394 175.13 795.176 177.505C798.957 179.879 801.816 183.309 803.75 187.794C805.773 192.191 806.784 197.6 806.784 204.02V242.012H787.129V205.867C787.129 201.03 786.074 197.292 783.963 194.654C781.94 191.928 778.686 190.564 774.201 190.564C771.563 190.564 769.144 191.224 766.946 192.543C764.835 193.774 763.164 195.577 761.933 197.952C760.702 200.326 760.086 203.184 760.086 206.526V242.012H740.299ZM851.096 242.012C846.259 242.012 841.994 241.264 838.3 239.769C834.606 238.186 831.748 235.636 829.725 232.118C827.703 228.6 826.691 223.807 826.691 217.739V192.016H815.347V175.526H826.691L828.802 156.794H846.479V175.526H863.496V192.016H846.479V218.003C846.479 220.641 847.05 222.532 848.194 223.675C849.425 224.731 851.492 225.258 854.394 225.258H863.496V242.012H851.096ZM903.112 243.595C896.868 243.595 891.459 242.627 886.886 240.693C882.401 238.67 878.839 235.944 876.201 232.514C873.651 229.084 872.2 225.214 871.848 220.905H891.503C891.855 222.4 892.471 223.763 893.35 224.995C894.318 226.138 895.593 227.061 897.176 227.765C898.847 228.38 900.694 228.688 902.716 228.688C904.915 228.688 906.674 228.424 907.993 227.897C909.4 227.281 910.455 226.49 911.159 225.522C911.862 224.555 912.214 223.543 912.214 222.488C912.214 220.817 911.687 219.542 910.631 218.663C909.664 217.783 908.213 217.08 906.278 216.552C904.343 215.936 902.013 215.365 899.286 214.837C896.12 214.133 892.954 213.342 889.788 212.463C886.71 211.495 883.94 210.308 881.478 208.901C879.103 207.494 877.169 205.691 875.673 203.492C874.266 201.206 873.563 198.435 873.563 195.182C873.563 191.224 874.662 187.662 876.861 184.496C879.059 181.242 882.225 178.692 886.359 176.845C890.492 174.91 895.505 173.943 901.397 173.943C909.752 173.943 916.304 175.79 921.053 179.484C925.802 183.177 928.616 188.146 929.495 194.39H911.027C910.499 192.631 909.4 191.312 907.729 190.433C906.058 189.465 903.947 188.981 901.397 188.981C898.495 188.981 896.296 189.465 894.801 190.433C893.306 191.4 892.559 192.675 892.559 194.258C892.559 195.313 893.042 196.281 894.01 197.16C895.065 197.952 896.56 198.655 898.495 199.271C900.43 199.887 902.804 200.502 905.618 201.118C910.983 202.261 915.6 203.492 919.47 204.811C923.427 206.131 926.505 208.065 928.704 210.616C930.902 213.078 931.958 216.684 931.87 221.433C931.958 225.742 930.814 229.568 928.44 232.91C926.153 236.251 922.855 238.89 918.546 240.824C914.237 242.671 909.092 243.595 903.112 243.595Z" fill="#282828" />
            </svg>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navegação */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleAllComponentsClick} isActive={isActive('/components') && !selectedSite}>
                  <Component className="h-4 w-4" />
                  <span>All components</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Libraries */}
        

        {/* Coming Soon */}
        <SidebarGroup>
          <SidebarGroupLabel>Coming Soon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <Bot className="h-4 w-4" />
                  <span>Agents</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    Coming soon
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <Video className="h-4 w-4" />
                  <span>Videos</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    Coming soon
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* My Libraries */}
        <SidebarGroup>
          <SidebarGroupLabel>My Libraries</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sitesLoading ? <SidebarMenuItem>
                  <div className="px-2 py-1 text-sm text-muted-foreground">Carregando sites...</div>
                </SidebarMenuItem> : sites.length === 0 ? <SidebarMenuItem>
                  <div className="px-2 py-1 text-sm text-muted-foreground">Nenhum site conectado</div>
                </SidebarMenuItem> : sites.map(site => <SidebarMenuItem key={site.id}>
                    <SidebarMenuButton onClick={() => handleSiteSelect(site.id)} isActive={selectedSite === site.id}>
                      <Globe className="h-4 w-4" />
                      <span className="truncate">{site.site_name || site.site_url}</span>
                      {site.component_count && <Badge variant="outline" className="ml-auto text-xs">
                          {site.component_count}
                        </Badge>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {emailInitial}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">{displayName}</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-accent rounded-md transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link to="/profile" onClick={handleNavigationClick} className="cursor-pointer flex w-full items-center">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/components" onClick={handleNavigationClick} className="cursor-pointer flex w-full items-center">
                  <Database className="mr-2 h-4 w-4" />
                  <span>Meus Componentes</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Configurações</DropdownMenuLabel>
              
              <DropdownMenuItem asChild>
                <Link to="/wordpress" onClick={handleNavigationClick} className="cursor-pointer flex w-full items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  <span>WordPress Integration</span>
                </Link>
              </DropdownMenuItem>
              
              {isAdmin && <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Administração</DropdownMenuLabel>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/admin" onClick={handleNavigationClick} className="cursor-pointer flex w-full items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Painel Admin</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/admin/users" onClick={handleNavigationClick} className="cursor-pointer flex w-full items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Gerenciar Usuários</span>
                    </Link>
                  </DropdownMenuItem>
                </>}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>;
};