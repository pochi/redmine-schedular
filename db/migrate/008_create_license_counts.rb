class CreateLicenseCounts < ActiveRecord::Migration
  def change
    create_table :license_counts do |t|
      t.integer :schedule_id
      t.date :date
      t.integer :count, :default => 0
    end
  end
end
