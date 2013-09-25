class CreateLicenseParticipations < ActiveRecord::Migration
  def change
    create_table :license_participations do |t|
      t.integer :schedule_id
      t.integer :user_id
    end
  end
end
