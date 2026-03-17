"use client";

import { useState, useEffect } from "react";
import styles from "./Loyalty.module.css";
import { motion } from "framer-motion";
import { Users, Award, Star, Search } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function LoyaltyView() {
  const { members, fetchMembers } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm)
  );

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <Users size={28} className={styles.icon} />
          <h2>Loyalty Program</h2>
        </div>
        
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search member by name or phone..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
           <h3>Total Members</h3>
           <p className={styles.statVal}>{members.length}</p>
        </div>
        <div className={styles.statCard}>
           <h3>Active Points</h3>
           <p className={styles.statVal}>{members.reduce((s, m) => s + m.points, 0)}</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Points</th>
              <th>Tier</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <tr key={member._id}>
                <td data-label="ID">{member.id}</td>
                <td data-label="Name" className={styles.memberName}>{member.name}</td>
                <td data-label="Phone">{member.phone}</td>
                <td data-label="Points" className={styles.pointsCol}><Star size={14} className={styles.starIcon}/> {member.points}</td>
                <td data-label="Tier">
                  <span className={`${styles.tierBadge} ${styles[member.tier.toLowerCase()]}`}>
                    <Award size={14} /> {member.tier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
