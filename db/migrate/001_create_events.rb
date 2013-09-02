class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.integer :project_id
      t.text :contents
      t.date :date
    end
  end
end
