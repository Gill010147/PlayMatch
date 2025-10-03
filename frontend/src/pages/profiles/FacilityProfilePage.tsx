import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProfilesService } from "../../services/api";
import type { FacilityProfile } from "../../types/domain";

export default function FacilityProfilePage() {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [data, setData] = useState<FacilityProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facilityId) return;
    let mounted = true;
    setLoading(true);
    ProfilesService.getFacility(facilityId)
      .then((d: any) => { if (mounted) setData(d || null); })
      .catch((e) => { if (mounted) setError(e?.message || "불러오지 못했습니다."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [facilityId]);

  if (loading) return <div style={{ padding: 16 }}>불러오는 중…</div>;
  if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
  if (!data) return <div style={{ padding: 16 }}>데이터가 없습니다.</div>;

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px", display: "grid", gap: 12 }}>
      <h2>{data.name}</h2>
      <div>{data.address}</div>
    </div>
  );
}













