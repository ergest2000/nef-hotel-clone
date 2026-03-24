import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile, useChangePassword } from "@/hooks/useProfile";
import { useWishlist } from "@/hooks/useCollections";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Building2, Phone, MapPin, Heart, ShoppingBag, Settings } from "lucide-react";

const MyAccount = () => {
  const { user, signOut } = useAuth();
  const { isAl } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: profile, isLoading } = useProfile(user?.id);
  const { data: wishlistItems } = useWishlist(user?.id);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [activeTab, setActiveTab] = useState<"profile" | "password" | "wishlist">("profile");
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    business_name: "",
    phone: "",
    country: "",
    city: "",
  });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });

  // Load profile data into form
  if (profile && !profileLoaded) {
    setProfileForm({
      full_name: profile.full_name || "",
      business_name: profile.business_name || "",
      phone: profile.phone || "",
      country: profile.country || "",
      city: profile.city || "",
    });
    setProfileLoaded(true);
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ id: user.id, ...profileForm });
      toast({ title: isAl ? "Profili u përditësua!" : "Profile updated!" });
    } catch {
      toast({ title: isAl ? "Gabim" : "Error", variant: "destructive" });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: isAl ? "Fjalëkalimet nuk përputhen" : "Passwords don't match", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: isAl ? "Fjalëkalimi duhet të jetë min 6 karaktere" : "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    try {
      await changePassword.mutateAsync(passwordForm.newPassword);
      toast({ title: isAl ? "Fjalëkalimi u ndryshua!" : "Password changed!" });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch {
      toast({ title: isAl ? "Gabim" : "Error", variant: "destructive" });
    }
  };

  const tabs = [
    { key: "profile" as const, label: isAl ? "Profili Im" : "My Profile", icon: User },
    { key: "password" as const, label: isAl ? "Ndrysho Fjalëkalimin" : "Change Password", icon: Lock },
    { key: "wishlist" as const, label: isAl ? "Të Preferuarat" : "Wishlist", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      <section className="py-12 md:py-16 flex-1">
        <div className="container">
          <h1 className="text-2xl md:text-3xl font-light tracking-brand text-foreground text-center mb-2">
            {isAl ? "LLOGARIA IME" : "MY ACCOUNT"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-10">
            {user.email}
          </p>

          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex border-b border-border mb-8 overflow-x-auto">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-6 py-3 text-xs tracking-brand uppercase whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSave} className="bg-background border border-border p-8 md:p-10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs tracking-brand text-muted-foreground uppercase flex items-center gap-1.5">
                      <User size={14} /> {isAl ? "Emri i plotë" : "Full Name"}
                    </label>
                    <Input
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs tracking-brand text-muted-foreground uppercase flex items-center gap-1.5">
                      <Building2 size={14} /> {isAl ? "Emri i biznesit" : "Business Name"}
                    </label>
                    <Input
                      value={profileForm.business_name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, business_name: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs tracking-brand text-muted-foreground uppercase flex items-center gap-1.5">
                      <Phone size={14} /> {isAl ? "Telefoni" : "Phone"}
                    </label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs tracking-brand text-muted-foreground uppercase flex items-center gap-1.5">
                      <MapPin size={14} /> {isAl ? "Qyteti" : "City"}
                    </label>
                    <Input
                      value={profileForm.city}
                      onChange={(e) => setProfileForm((p) => ({ ...p, city: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase flex items-center gap-1.5">
                    <MapPin size={14} /> {isAl ? "Shteti" : "Country"}
                  </label>
                  <Input
                    value={profileForm.country}
                    onChange={(e) => setProfileForm((p) => ({ ...p, country: e.target.value }))}
                    className="h-12"
                  />
                </div>
                <Button type="submit" disabled={updateProfile.isPending} className="w-full h-12 text-xs tracking-wide-brand uppercase">
                  {updateProfile.isPending ? (isAl ? "DUKE RUAJTUR..." : "SAVING...") : (isAl ? "RUAJ NDRYSHIMET" : "SAVE CHANGES")}
                </Button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handlePasswordChange} className="bg-background border border-border p-8 md:p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">
                    {isAl ? "Fjalëkalimi i ri" : "New Password"}
                  </label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="h-12"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">
                    {isAl ? "Konfirmo fjalëkalimin" : "Confirm Password"}
                  </label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="h-12"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" disabled={changePassword.isPending} className="w-full h-12 text-xs tracking-wide-brand uppercase">
                  {changePassword.isPending ? (isAl ? "DUKE NDRYSHUAR..." : "CHANGING...") : (isAl ? "NDRYSHO FJALËKALIMIN" : "CHANGE PASSWORD")}
                </Button>
              </form>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="bg-background border border-border p-8 md:p-10">
                {!wishlistItems || wishlistItems.length === 0 ? (
                  <div className="text-center py-10">
                    <Heart size={40} className="mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      {isAl ? "Nuk keni produkte të preferuara." : "No wishlist items."}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {isAl ? `Keni ${wishlistItems.length} produkte të preferuara.` : `You have ${wishlistItems.length} wishlist items.`}
                    </p>
                    <Button variant="outline" onClick={() => navigate("/wishlist")} className="text-xs tracking-wide-brand uppercase">
                      {isAl ? "SHIKO LISTËN E PLOTË" : "VIEW FULL WISHLIST"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Logout */}
            <div className="mt-8 text-center">
              <button
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
                className="text-xs tracking-brand text-destructive hover:text-destructive/80 uppercase transition-colors"
              >
                {isAl ? "DILNI NGA LLOGARIA" : "LOG OUT"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default MyAccount;
